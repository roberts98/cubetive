# E2E Testing Plan - Cubetive

**Generated**: 2025-11-30
**Status**: Planning Phase
**Testing Framework**: Playwright

---

## Executive Summary

This document outlines the comprehensive plan for implementing End-to-End (E2E) testing for the Cubetive speedcubing timer application. The plan is based on the codebase exploration conducted on 2025-11-30 and follows the guidelines specified in `.ai/prompts/generate-e2e-tests.md`.

**Current State**:

- ✅ Strong unit test coverage with Vitest (auth, profile, validation)
- ❌ No E2E testing infrastructure
- ❌ No data-testid attributes in components
- ✅ Complete authentication flows ready for testing
- ⚠️ Timer feature not yet implemented (core functionality pending)

**Goal**: Establish robust E2E testing infrastructure with focus on authentication flows, protected routes, and navigation - laying the foundation for timer feature testing when implemented.

---

## Strategic Decisions & Rationale

Based on exploration and user decisions, the following strategies have been confirmed:

### 1. Email Verification Handling

**Decision**: Disable email verification in test environment

**Rationale**:

- Simplifies test setup and execution
- Avoids complex email service infrastructure (Mailhog, MailCatcher)
- Reduces test flakiness from email delivery timing
- Focuses tests on application logic rather than email infrastructure

**Implementation**:

- Configure test Supabase project to disable email confirmation requirement
- Use Supabase dashboard: Authentication > Email Auth > "Enable email confirmations" = OFF
- Document this configuration in README and test setup docs

### 2. Test Data Management

**Decision**: Use separate test Supabase project with `.env.test` configuration

**Rationale**:

- Clean isolation from development and production data
- Existing `.env.test` file suggests infrastructure already in place
- No risk of polluting dev/prod databases with test data
- Can configure test-specific settings (email verification disabled)

**Implementation**:

- Verify `.env.test` contains test Supabase credentials
- Create `.env.test.local` for local overrides (git-ignored)
- Use `process.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Playwright config
- **Global teardown**: Delete all test data after test runs (see section below)

### 3. Authenticated Session Reuse

**Decision**: Use Playwright's storage state API

**Rationale**:

- Native Playwright feature, well-documented and maintained
- Automatically captures cookies, localStorage, sessionStorage
- Supabase auth tokens stored in localStorage - compatible with storageState
- Standard approach used by Playwright community

**Implementation**:

- Create `auth.setup.ts` fixture to perform login once
- Save session via `page.context().storageState({ path: 'e2e/.auth/user.json' })`
- Load session in tests via `storageState: 'e2e/.auth/user.json'` in context config
- Run auth setup as dependency project before main tests

### 4. Test ID Strategy

**Decision**: Add `data-testid` attributes incrementally as tests are written

**Rationale**:

- Minimizes upfront component changes
- Test-driven approach - add selectors when needed
- Reduces PR size and merge conflicts
- Allows evaluation of which selectors are truly necessary

**Implementation**:

- Establish naming convention: `data-testid="auth-email-input"`, `data-testid="auth-login-button"`
- Prefer semantic selectors (labels, roles) where stable
- Add data-testid for dynamic content or when semantic selectors are unreliable
- Document selector strategy in test README

### 5. Browser Configuration

**Decision**: Chromium/Desktop Chrome only (per guidelines)

**Rationale**:

- Faster test execution (single browser)
- Reduced infrastructure complexity
- Cubetive is a web app with modern browser requirements
- Can expand to Firefox/Safari later if needed

---

## Infrastructure Setup

### Phase 1: Playwright Installation & Configuration

#### 1.1 Install Dependencies

```bash
npm install -D @playwright/test
npx playwright install chromium
```

#### 1.2 Create `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Global teardown - runs after ALL tests complete
  globalTeardown: './e2e/global-teardown.ts',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project - runs once before all tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main test project - depends on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load authenticated session from setup
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Tests that don't need authentication (public pages)
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.public\.spec\.ts/,
    },
  ],

  // Start dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

#### 1.3 Create `.env.test` (if not exists)

```env
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-test-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Required for teardown

E2E_USERNAME_ID=test-user-uuid
E2E_USERNAME=test@example.com
E2E_PASSWORD=test-password
```

**Important**: Get `VITE_SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Settings → API → `service_role` key (secret)

#### 1.4 Update `.gitignore`

```gitignore
# Playwright
e2e/.auth/
playwright-report/
test-results/
playwright/.cache/

# Test environment
.env.test.local
```

#### 1.5 Add npm scripts to `package.json`

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Global Teardown Strategy

### Overview

After all E2E tests complete, we need to clean up test data to ensure a fresh state for the next test run. This prevents data pollution, maintains test isolation across runs, and ensures consistent test results.

**Strategy**: Delete all test data after tests complete using Supabase service role key.

### Why We Need Teardown

1. **Clean slate**: Each test run starts with predictable, fresh data
2. **No data pollution**: Tests don't interfere with each other across runs
3. **Consistent state**: Prevents "works locally, fails in CI" issues
4. **Resource management**: Prevents unbounded growth of test data
5. **CI/CD friendly**: Tests can run repeatedly without manual cleanup

### Teardown Approach

**What it does**:

1. Connects to test Supabase using service role key (bypasses RLS policies)
2. Deletes all solve records (except those belonging to preserved test user)
3. Deletes all profile records (except preserved test user)
4. Deletes all auth users (except preserved test user specified by `E2E_USERNAME_ID`)
5. Preserves the permanent test user needed for authenticated session reuse

**When it runs**: After ALL E2E tests complete (configured via `globalTeardown` in `playwright.config.ts`)

### Implementation

Create `e2e/global-teardown.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

async function globalTeardown() {
  console.log('\n🧹 Starting E2E test teardown...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const preserveUserId = process.env.E2E_USERNAME_ID;

  // Validate environment
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables');
  }

  // Safety check: Ensure we're using test environment
  if (!supabaseUrl.includes('your-test-project-id')) {
    throw new Error('Safety check failed: Not using test Supabase project');
  }

  // Create admin client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete solves (cascade will handle profiles)
  await supabase
    .from('solves')
    .delete()
    .neq('user_id', preserveUserId || '00000000-0000-0000-0000-000000000000');

  // Delete profiles
  await supabase
    .from('profiles')
    .delete()
    .neq('id', preserveUserId || '00000000-0000-0000-0000-000000000000');

  // Delete auth users (most critical - cascades to profiles/solves)
  const { data: users } = await supabase.auth.admin.listUsers();

  for (const user of users.users) {
    if (user.id !== preserveUserId) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }

  console.log('✨ Teardown complete!\n');
}

export default globalTeardown;
```

### Configuration Requirements

**Environment Variables** (`.env.test`):

```env
# Test Supabase project
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Service role key (required for teardown - bypasses RLS)
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Permanent test user (preserved during teardown)
E2E_USERNAME_ID=uuid-of-test-user
E2E_USERNAME=test@example.com
E2E_PASSWORD=test-password
```

**Getting the Service Role Key**:

1. Go to Supabase Dashboard
2. Navigate to Settings → API
3. Find `service_role` key under "Project API keys"
4. Copy the secret key (starts with `eyJ...`)
5. Add to `.env.test` as `VITE_SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Security Warning**: The service role key has full admin access. Never commit it to version control or expose it publicly.

### Safety Features

1. **Environment validation**: Verifies test Supabase URL before deletion
2. **User preservation**: Never deletes the permanent test user (auth setup dependency)
3. **Service role required**: Uses admin key to bypass RLS policies
4. **Detailed logging**: Shows exactly what was deleted for debugging
5. **Error handling**: Fails gracefully with clear error messages

### Integration with Playwright

**In `playwright.config.ts`**:

```typescript
export default defineConfig({
  // ... other config

  // Global teardown runs after all tests complete
  globalTeardown: './e2e/global-teardown.ts',

  // ... rest of config
});
```

### Test User Preservation

**Why preserve a test user?**

- Required for authenticated session reuse (`auth.setup.ts`)
- Creating users during teardown is expensive
- Maintains consistent test user credentials across runs

**How it works**:

- `E2E_USERNAME_ID` environment variable specifies user to keep
- Teardown skips deletion of this specific user ID
- All other users created during tests are deleted

### Running Teardown Manually

```bash
# Run teardown script directly (useful for debugging)
npx tsx e2e/global-teardown.ts
```

### Troubleshooting

**Error: "VITE_SUPABASE_SERVICE_ROLE_KEY is not set"**

- Solution: Get service role key from Supabase Dashboard → Settings → API
- Add to `.env.test` file

**Error: "Safety check failed"**

- Solution: The script detected a non-test Supabase URL
- This prevents accidental deletion of production data
- Verify `.env.test` uses correct test project URL

**Teardown deletes too much data**

- Solution: Verify `E2E_USERNAME_ID` matches your test user's UUID
- Check preservation logic in `global-teardown.ts`

**Teardown is too slow**

- Solution: Optimize deletion queries (use batch operations)
- Consider deleting only recent test data instead of all data

### Alternative Approaches (Not Chosen)

We evaluated these alternatives but chose global teardown with service role key:

| Approach                   | Pros                 | Cons                                 | Verdict            |
| -------------------------- | -------------------- | ------------------------------------ | ------------------ |
| **No teardown**            | Simple               | Data accumulates, tests fail         | ❌ Not viable      |
| **Manual cleanup**         | Full control         | Error-prone, not CI-friendly         | ❌ Not scalable    |
| **Per-test cleanup**       | Granular             | Slow, complex                        | ❌ Performance hit |
| **Database reset**         | Complete wipe        | Loses seed data, requires recreation | ❌ Too destructive |
| **Pattern-based deletion** | Flexible             | Can miss data                        | ❌ Unreliable      |
| **Service role teardown**  | Fast, complete, safe | Requires service key                 | ✅ **Chosen**      |

---

## Test Structure & Organization

### Directory Structure

```
/e2e
├── /fixtures
│   ├── auth.setup.ts           # Authentication fixture (runs once)
│   └── test-users.ts           # Test user credentials
├── /page-objects
│   ├── base.page.ts            # Base page class with common methods
│   ├── landing.page.ts         # Landing page POM
│   ├── login.page.ts           # Login page POM
│   ├── register.page.ts        # Register page POM
│   ├── reset-password.page.ts # Reset password POM
│   ├── verify-email.page.ts   # Email verification POM
│   ├── dashboard.page.ts       # Dashboard POM
│   └── profile.page.ts         # Profile page POM
├── /tests
│   ├── auth.public.spec.ts     # Auth tests (no session needed)
│   ├── auth-flows.spec.ts      # Complete auth flows (uses session)
│   ├── navigation.spec.ts      # Navigation tests
│   ├── protected-routes.spec.ts # Route protection tests
│   └── profile.spec.ts         # Profile page tests
└── /.auth
    └── user.json               # Saved authenticated session (git-ignored)
```

### Page Object Model (POM) Design

#### Base Page Class

```typescript
// e2e/page-objects/base.page.ts
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoadState() {
    await this.page.waitForLoadState('networkidle');
  }

  // Common helper methods
  async clickButton(text: string) {
    await this.page.getByRole('button', { name: text }).click();
  }

  async fillInput(label: string, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  async getErrorMessage() {
    return this.page.getByRole('alert').textContent();
  }
}
```

#### Login Page Example

```typescript
// e2e/page-objects/login.page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  // Selectors (will add data-testid incrementally)
  private readonly emailInput = () => this.page.getByLabel('Email');
  private readonly passwordInput = () => this.page.getByLabel('Password');
  private readonly rememberMeCheckbox = () => this.page.getByLabel('Remember me');
  private readonly submitButton = () => this.page.getByRole('button', { name: 'Login' });
  private readonly registerLink = () => this.page.getByRole('link', { name: 'Sign up' });
  private readonly forgotPasswordLink = () =>
    this.page.getByRole('link', { name: 'Forgot password?' });

  async goto() {
    await super.goto(this.url);
    await this.waitForLoadState();
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox().check();
    }

    await this.submitButton().click();
  }

  async expectErrorMessage(message: string) {
    const error = await this.getErrorMessage();
    expect(error).toContain(message);
  }

  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL('/dashboard');
  }
}
```

### Authentication Setup Fixture

```typescript
// e2e/fixtures/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import { TEST_USER } from './test-users';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill login form
  await page.getByLabel('Email').fill(TEST_USER.email);
  await page.getByLabel('Password').fill(TEST_USER.password);

  // Submit and wait for redirect
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for redirect to dashboard (confirms successful login)
  await page.waitForURL('/dashboard');

  // Verify logged in state
  await expect(page.getByText(TEST_USER.email)).toBeVisible();

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
```

### Test User Management

```typescript
// e2e/fixtures/test-users.ts
export const TEST_USER = {
  email: 'e2e-test-user@cubetive.test',
  username: 'e2e_test_user',
  password: 'Test1234!@#$',
};

export const TEST_USERS = {
  standard: TEST_USER,
  newUser: {
    email: 'e2e-new-user@cubetive.test',
    username: 'e2e_new_user',
    password: 'NewUser1234!',
  },
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Goal**: Set up infrastructure and basic smoke tests

**Tasks**:

1. ✅ Install Playwright and dependencies
2. ✅ Create `playwright.config.ts` with Chromium-only setup
3. ✅ Verify `.env.test` configuration
4. ✅ Create directory structure (`/e2e/page-objects`, `/e2e/tests`, `/e2e/fixtures`)
5. ✅ Implement `BasePage` class
6. ✅ Create test user in test Supabase project
7. ✅ Implement auth setup fixture
8. ✅ Write first smoke test (landing page loads)

**Deliverables**:

- Working Playwright configuration
- Authenticated session reuse working
- 1-2 basic smoke tests passing

### Phase 2: Authentication Tests (Week 2)

**Goal**: Comprehensive coverage of auth flows

**Tasks**:

1. ✅ Create Login, Register, ResetPassword, VerifyEmail page objects
2. ✅ Add data-testid to auth form inputs (incrementally)
3. ✅ Write login flow tests (success, invalid credentials, validation errors)
4. ✅ Write registration flow tests (success, duplicate user, password mismatch)
5. ✅ Write password reset flow tests
6. ✅ Write email verification tests (auto-verify, manual code entry)
7. ✅ Write logout tests

**Test Files**:

- `auth.public.spec.ts` - Login, register, reset password (no auth needed)
- `auth-flows.spec.ts` - Complete flows requiring authenticated session
- `logout.spec.ts` - Logout and session clearing

**Deliverables**:

- Complete auth test coverage
- Auth page objects
- 15-20 auth tests passing

### Phase 3: Protected Routes & Navigation (Week 3)

**Goal**: Test route protection and navigation flows

**Tasks**:

1. ✅ Create Dashboard and Profile page objects
2. ✅ Write protected route access tests (unauthenticated access redirects)
3. ✅ Write authenticated navigation tests (dashboard, profile)
4. ✅ Write return URL preservation tests (login redirect back to intended page)
5. ✅ Write navigation between all public pages tests
6. ✅ Write protected route component tests (navbar, logout button)

**Test Files**:

- `protected-routes.spec.ts` - Route protection enforcement
- `navigation.spec.ts` - Navigation flows
- `dashboard.spec.ts` - Dashboard page functionality
- `profile.spec.ts` - Profile page tabs and navigation

**Deliverables**:

- Protected route test coverage
- Navigation flow tests
- Dashboard and Profile page objects
- 10-15 tests passing

### Phase 4: Advanced Scenarios (Week 4)

**Goal**: Edge cases and integration scenarios

**Tasks**:

1. ✅ Test session expiration handling
2. ✅ Test browser back/forward navigation
3. ✅ Test multiple tabs (session sync)
4. ✅ Test password strength indicator
5. ✅ Test form validation edge cases
6. ✅ Test error message display
7. ✅ Test loading states

**Test Files**:

- `edge-cases.spec.ts` - Edge case scenarios
- `form-validation.spec.ts` - Comprehensive form validation

**Deliverables**:

- Edge case coverage
- 10-15 additional tests

### Phase 5: CI/CD Integration (Week 5)

**Goal**: Automate E2E tests in CI pipeline

**Tasks**:

1. ✅ Configure GitHub Actions workflow
2. ✅ Add E2E tests to pre-commit/pre-push hooks (optional)
3. ✅ Set up test result reporting
4. ✅ Configure test artifacts (screenshots, videos)
5. ✅ Document test execution in README

**Deliverables**:

- E2E tests running in CI
- Test reports published
- Documentation updated

### Phase 6: Timer Feature Tests (Future)

**Goal**: Test core timer functionality when implemented

**Tasks**:

1. ⏳ Create Timer page object
2. ⏳ Test timer start/stop with spacebar
3. ⏳ Test scramble generation display
4. ⏳ Test solve time recording
5. ⏳ Test penalty application (+2, DNF)
6. ⏳ Test statistics calculations (Ao5, Ao12, Ao100)
7. ⏳ Test solve history display

**Note**: Timer feature is not yet implemented. These tests will be written when the feature is developed.

---

## Test Coverage Matrix

### Critical Path Tests (Must Have)

| Feature              | Test Scenario                                      | Status     | Priority |
| -------------------- | -------------------------------------------------- | ---------- | -------- |
| **Login**            | Successful login with valid credentials            | ⏳ Pending | P0       |
| **Login**            | Failed login with invalid credentials              | ⏳ Pending | P0       |
| **Login**            | Remember me checkbox persists session              | ⏳ Pending | P0       |
| **Register**         | Successful registration and redirect               | ⏳ Pending | P0       |
| **Register**         | Validation errors (duplicate email, weak password) | ⏳ Pending | P0       |
| **Register**         | Password confirmation mismatch                     | ⏳ Pending | P0       |
| **Verify Email**     | Auto-verification via email link                   | ⏳ Pending | P0       |
| **Verify Email**     | Manual 6-digit code entry                          | ⏳ Pending | P1       |
| **Reset Password**   | Request password reset email                       | ⏳ Pending | P0       |
| **Reset Password**   | Set new password via reset link                    | ⏳ Pending | P0       |
| **Reset Password**   | Login with new password                            | ⏳ Pending | P0       |
| **Protected Routes** | Unauthenticated access redirects to login          | ⏳ Pending | P0       |
| **Protected Routes** | Authenticated access allowed                       | ⏳ Pending | P0       |
| **Protected Routes** | Return URL preserved after login                   | ⏳ Pending | P1       |
| **Logout**           | Logout clears session and redirects                | ⏳ Pending | P0       |
| **Logout**           | Cannot access protected routes after logout        | ⏳ Pending | P0       |

### Secondary Tests (Important)

| Feature        | Test Scenario                                 | Status     | Priority |
| -------------- | --------------------------------------------- | ---------- | -------- |
| **Navigation** | Navigate between all public pages             | ⏳ Pending | P1       |
| **Navigation** | Landing page CTA buttons work                 | ⏳ Pending | P1       |
| **Dashboard**  | Dashboard displays user email                 | ⏳ Pending | P1       |
| **Dashboard**  | Navigation to profile page works              | ⏳ Pending | P1       |
| **Profile**    | Profile tabs render (General, Account, Stats) | ⏳ Pending | P1       |
| **Profile**    | Tab switching works                           | ⏳ Pending | P1       |
| **Forms**      | Form validation displays errors               | ⏳ Pending | P2       |
| **Forms**      | Password visibility toggle works              | ⏳ Pending | P2       |
| **Forms**      | Password strength indicator updates           | ⏳ Pending | P2       |

### Future Tests (Timer Feature - Not Implemented)

| Feature        | Test Scenario               | Status             | Priority |
| -------------- | --------------------------- | ------------------ | -------- |
| **Timer**      | Start timer with spacebar   | ⏳ Not Implemented | P0       |
| **Timer**      | Stop timer with spacebar    | ⏳ Not Implemented | P0       |
| **Timer**      | Display scramble algorithm  | ⏳ Not Implemented | P0       |
| **Timer**      | Save solve time to database | ⏳ Not Implemented | P0       |
| **Timer**      | Apply +2 penalty            | ⏳ Not Implemented | P1       |
| **Timer**      | Apply DNF penalty           | ⏳ Not Implemented | P1       |
| **Statistics** | Calculate and display Ao5   | ⏳ Not Implemented | P0       |
| **Statistics** | Calculate and display Ao12  | ⏳ Not Implemented | P0       |
| **Statistics** | Calculate and display Ao100 | ⏳ Not Implemented | P1       |
| **History**    | Display solve history       | ⏳ Not Implemented | P1       |
| **History**    | Delete solve from history   | ⏳ Not Implemented | P2       |

**Legend**:

- P0: Critical - Core functionality, must work
- P1: High - Important user flows
- P2: Medium - Nice to have, enhances UX

---

## Best Practices & Guidelines

### 1. Test Structure (Arrange-Act-Assert)

Follow the AAA pattern for clarity and readability:

```typescript
test('user can login with valid credentials', async ({ page }) => {
  // ARRANGE
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // ACT
  await loginPage.login(TEST_USER.email, TEST_USER.password);

  // ASSERT
  await loginPage.expectRedirectToDashboard();
});
```

### 2. Use Page Object Model Consistently

- Encapsulate page interactions in page objects
- Keep test files focused on test logic, not implementation details
- Reuse page object methods across tests

```typescript
// ❌ Bad: Direct page interactions in test
test('login test', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@test.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
});

// ✅ Good: Use page object
test('login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@test.com', 'password');
});
```

### 3. Prefer Semantic Selectors

Prioritize selectors in this order:

1. Role-based: `page.getByRole('button', { name: 'Login' })`
2. Label-based: `page.getByLabel('Email')`
3. Text-based: `page.getByText('Welcome')`
4. Test ID: `page.getByTestId('auth-email-input')` (when above fail)

### 4. Add data-testid Incrementally

Only add `data-testid` when:

- Semantic selectors are unreliable (dynamic text, multiple similar elements)
- Element doesn't have a clear role or label
- Need to target specific instance among many

**Naming convention**: `feature-element-type`

- Examples: `auth-email-input`, `auth-login-button`, `profile-username-field`

### 5. Use Test Hooks for Setup/Teardown

```typescript
import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Setup before each test
  await page.goto('/');
});

test.afterEach(async ({ page }) => {
  // Cleanup after each test (if needed)
});
```

### 6. Leverage Parallel Execution

- Playwright runs tests in parallel by default
- Ensure tests are isolated (no shared state)
- Use separate test users if needed for parallel runs

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true, // Run tests in parallel
  workers: process.env.CI ? 1 : undefined, // Limit workers in CI
});
```

### 7. Use expect Assertions with Specific Matchers

```typescript
// ✅ Good: Specific assertions
await expect(page).toHaveURL('/dashboard');
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.getByLabel('Email')).toBeVisible();
await expect(page.getByRole('alert')).toContainText('Invalid credentials');

// ❌ Avoid: Generic assertions
expect(await page.url()).toBe('/dashboard');
expect(await page.locator('h1').textContent()).toBe('Welcome');
```

### 8. Use Trace Viewer for Debugging

```bash
# Run with trace
npm run test:e2e -- --trace on

# View trace
npx playwright show-trace trace.zip
```

### 9. Use Codegen for Initial Test Recording

```bash
# Record a test
npx playwright codegen http://localhost:5173

# Use recorded test as a starting point, then refactor into page objects
```

### 10. Handle Asynchronous Operations

```typescript
// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for element
await page.waitForSelector('[data-testid="profile-loaded"]');

// Wait for network idle (use sparingly)
await page.waitForLoadState('networkidle');

// Auto-waiting: Playwright auto-waits for elements to be actionable
await page.getByRole('button').click(); // Waits for button to be visible and enabled
```

---

## Risks & Mitigations

### Risk 1: Test Flakiness

**Impact**: High - Unreliable tests undermine confidence

**Causes**:

- Race conditions (async operations)
- Network timing issues
- Animation/transition timing

**Mitigations**:

- ✅ Use Playwright's auto-waiting features
- ✅ Avoid `page.waitForTimeout()` - use explicit waits instead
- ✅ Use `waitForLoadState('networkidle')` for page loads
- ✅ Disable animations in test environment
- ✅ Configure retries in CI (`retries: 2`)

### Risk 2: Test Data Pollution

**Impact**: Medium - Tests fail due to shared state

**Causes**:

- Multiple test runs against same database
- Tests not cleaning up after themselves
- Parallel tests using same test users

**Mitigations**:

- ✅ Use separate test Supabase project (already decided)
- ✅ Generate unique usernames for registration tests (`e2e_test_${Date.now()}`)
- ✅ Implement cleanup hooks to delete test data
- ✅ Consider database reset between test runs in CI

### Risk 3: Slow Test Execution

**Impact**: Medium - Slow feedback loop

**Causes**:

- Full login flow in every test
- Too many tests running serially
- Network delays to Supabase

**Mitigations**:

- ✅ Use authenticated session reuse (already decided)
- ✅ Enable parallel test execution
- ✅ Run critical path tests first, secondary tests later
- ✅ Consider local Supabase for faster tests (future optimization)

### Risk 4: Maintenance Burden

**Impact**: Medium - Tests break frequently

**Causes**:

- Brittle selectors (CSS classes, XPath)
- Hardcoded test data
- Poor test organization

**Mitigations**:

- ✅ Use semantic selectors (role, label, text)
- ✅ Add data-testid only when necessary
- ✅ Page Object Model encapsulates selector changes
- ✅ Centralized test user management
- ✅ Clear test structure (AAA pattern)

### Risk 5: Environment Configuration Issues

**Impact**: High - Tests don't run

**Causes**:

- Missing `.env.test` configuration
- Test Supabase project not configured correctly
- Email verification not disabled in test project

**Mitigations**:

- ✅ Document test environment setup in README
- ✅ Create setup script to verify configuration
- ✅ Add checks in `playwright.config.ts` for required env vars
- ✅ Provide sample `.env.test.example` file

---

## Success Metrics

### Phase 1 (Foundation) - Week 1

- ✅ Playwright running successfully
- ✅ 1-2 smoke tests passing
- ✅ Auth session reuse working

### Phase 2 (Auth Tests) - Week 2

- ✅ 15-20 auth tests passing
- ✅ All critical auth flows covered
- ✅ Test execution time < 2 minutes

### Phase 3 (Protected Routes) - Week 3

- ✅ 25-30 total tests passing
- ✅ All protected routes tested
- ✅ Navigation flows covered

### Phase 4 (Edge Cases) - Week 4

- ✅ 35-40 total tests passing
- ✅ Edge cases covered
- ✅ Test execution time < 5 minutes

### Phase 5 (CI/CD) - Week 5

- ✅ Tests running in CI on every PR
- ✅ Test reports published
- ✅ < 10 minute CI execution time

### Long-term Goals

- 🎯 80%+ E2E coverage of critical paths
- 🎯 < 1% test flakiness rate
- 🎯 All PRs require passing E2E tests
- 🎯 E2E tests catch regressions before production

---

## Documentation Requirements

### 1. README Update

Add E2E testing section to main README:

````markdown
## E2E Testing

```bash
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Run with Playwright UI
npm run test:e2e:debug  # Run in debug mode
```
````

See `/e2e/README.md` for detailed documentation.

```

### 2. E2E README (`/e2e/README.md`)
Create comprehensive E2E testing documentation:
- Getting started (setup, first test run)
- Test environment configuration
- Writing new tests
- Page Object Model guide
- Adding data-testid attributes
- Debugging failing tests
- CI/CD integration

### 3. Test User Documentation
Document test user creation and management in test Supabase project

### 4. Troubleshooting Guide
Common issues and solutions:
- Tests timing out
- Auth session not persisting
- Supabase connection errors
- Data-testid not found

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ Review and approve this plan
2. ✅ Install Playwright and create basic configuration
3. ✅ Create test user in test Supabase project
4. ✅ Verify `.env.test` configuration
5. ✅ Write first smoke test (landing page loads)

### Short-term (Next 2 Weeks)
1. ✅ Implement auth page objects
2. ✅ Write comprehensive auth tests
3. ✅ Add data-testid to auth components incrementally
4. ✅ Set up CI integration

### Medium-term (Next Month)
1. ✅ Complete protected route tests
2. ✅ Add navigation and edge case tests
3. ✅ Achieve 80%+ critical path coverage
4. ✅ Document E2E testing guide

### Long-term (Future)
1. ⏳ Wait for timer feature implementation
2. ⏳ Write timer E2E tests
3. ⏳ Add visual regression tests (if needed)
4. ⏳ Consider performance testing

---

## Conclusion

This E2E testing plan provides a comprehensive roadmap for implementing robust end-to-end testing for Cubetive. The plan prioritizes authentication flows (currently implemented and critical) while laying the foundation for future timer feature testing.

**Key Strengths**:
- ✅ Incremental, phased approach (5 weeks to full coverage)
- ✅ Leverages Playwright best practices (POM, storage state, semantic selectors)
- ✅ Pragmatic decisions based on project constraints (separate test env, incremental test IDs)
- ✅ Clear roadmap with measurable success metrics

**Key Risks Addressed**:
- ✅ Email verification complexity (disabled in test env)
- ✅ Test data management (separate test project)
- ✅ Slow test execution (auth session reuse)
- ✅ Maintenance burden (POM, semantic selectors)

**Ready to Proceed**:
The plan is actionable and ready for implementation. Start with Phase 1 (Foundation) to establish the infrastructure, then progressively build out test coverage following the roadmap.

**Questions or Concerns**:
- Need clarification on any decisions or strategies? Review the "Strategic Decisions" section.
- Unsure about implementation details? Check the code examples and best practices sections.
- Want to adjust the timeline? The phased approach is flexible - adjust based on team capacity.

---

**Document Status**: ✅ Complete and ready for implementation
**Next Action**: Begin Phase 1 - Install Playwright and create basic configuration
```
