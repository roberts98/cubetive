# E2E Testing Guide

This directory contains End-to-End (E2E) tests for Cubetive using Playwright.

## Quick Start

```bash
# Install dependencies (first time only)
npm install -D @playwright/test
npx playwright install chromium

# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Setup

### 1. Configure Test Environment

Copy `.env.test.example` to `.env.test` and fill in your test Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Required for teardown
E2E_USERNAME_ID=test-user-uuid
E2E_USERNAME=test@example.com
E2E_PASSWORD=test-password
```

**Important**: Get your `VITE_SUPABASE_SERVICE_ROLE_KEY` from:

- Supabase Dashboard → Settings → API → `service_role` key (secret)
- This key is required for the global teardown to clean test data

### 2. Create Test User

Manually create a test user in your test Supabase project:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → Create new user
3. Use the email/password from your `.env.test`
4. Copy the user's UUID to `E2E_USERNAME_ID`

### 3. Disable Email Verification (Test Environment Only)

In your test Supabase project:

1. Go to Authentication → Email Auth
2. Disable "Enable email confirmations"
3. This allows tests to login immediately without email verification

## Test Structure

```
/e2e
├── /fixtures
│   ├── auth.setup.ts           # Authentication setup (runs once)
│   └── test-users.ts           # Test user credentials
├── /page-objects
│   ├── base.page.ts            # Base page class
│   ├── login.page.ts           # Login page
│   ├── register.page.ts        # Register page
│   └── ...                     # Other page objects
├── /tests
│   ├── auth.public.spec.ts     # Auth tests (no session)
│   ├── auth-flows.spec.ts      # Auth flow tests (with session)
│   └── ...                     # Other test files
├── /.auth
│   └── user.json               # Saved authenticated session (git-ignored)
├── global-teardown.ts          # Cleanup test data after all tests
└── README.md                   # This file
```

## Global Teardown

### How It Works

After all E2E tests complete, the `global-teardown.ts` script automatically:

1. **Connects** to test Supabase using service role key (bypasses RLS)
2. **Deletes** all solve records (except those belonging to preserved test user)
3. **Deletes** all profile records (except preserved test user)
4. **Deletes** all auth users (except preserved test user specified by `E2E_USERNAME_ID`)
5. **Preserves** the permanent test user for next test run

### Why We Need It

- **Clean slate**: Each test run starts with a fresh database
- **No data pollution**: Tests don't interfere with each other across runs
- **Consistent state**: Predictable test environment
- **CI/CD friendly**: Tests can run repeatedly without manual cleanup

### Safety Features

1. **Environment validation**: Verifies test Supabase URL before deletion
2. **User preservation**: Never deletes the permanent test user
3. **Service role required**: Uses admin key to bypass RLS policies
4. **Detailed logging**: Shows exactly what was deleted

### Configuration

The teardown uses these environment variables from `.env.test`:

- `VITE_SUPABASE_URL` - Test Supabase project URL
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Admin key (required)
- `E2E_USERNAME_ID` - UUID of test user to preserve

### Running Manually

```bash
# Run teardown script directly
npx tsx e2e/global-teardown.ts
```

### Troubleshooting

**Error: "VITE_SUPABASE_SERVICE_ROLE_KEY is not set"**

- Get service role key from Supabase Dashboard → Settings → API
- Add it to `.env.test` (never commit this key!)

**Error: "Safety check failed"**

- The script detected a non-test Supabase URL
- This prevents accidental deletion of production data
- Verify your `.env.test` uses the correct test project URL

**Teardown deletes too much/too little**

- Adjust the deletion logic in `global-teardown.ts`
- Current strategy: Delete all except preserved test user

## Authenticated Session Reuse

To speed up tests, we authenticate once and reuse the session:

1. **Setup phase** (`auth.setup.ts`):
   - Runs before all tests
   - Logs in with test user credentials
   - Saves session to `e2e/.auth/user.json`

2. **Test phase**:
   - Tests load the saved session from storage state
   - Skip login flow (5-10x faster)
   - Start testing immediately

3. **Teardown phase** (`global-teardown.ts`):
   - Runs after all tests complete
   - Cleans up test data
   - Preserves test user for next run

### When to Skip Session Reuse

Some tests need to start without authentication:

- Login/registration tests
- Password reset tests
- Protected route access tests

Use the `chromium-public` project for these tests:

```typescript
// Use .public.spec.ts suffix to skip session loading
// File: auth.public.spec.ts
test('user can login', async ({ page }) => {
  // Starts with no auth session
});
```

## Writing Tests

### Page Object Model

Use page objects to encapsulate page interactions:

```typescript
// e2e/page-objects/login.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  async goto() {
    await super.goto(this.url);
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}
```

### Test Structure (Arrange-Act-Assert)

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USER } from '../fixtures/test-users';

test('user can login with valid credentials', async ({ page }) => {
  // ARRANGE
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // ACT
  await loginPage.login(TEST_USER.email, TEST_USER.password);

  // ASSERT
  await expect(page).toHaveURL('/dashboard');
});
```

### Selector Priority

1. **Role-based** (preferred): `page.getByRole('button', { name: 'Login' })`
2. **Label-based**: `page.getByLabel('Email')`
3. **Text-based**: `page.getByText('Welcome')`
4. **Test ID** (fallback): `page.getByTestId('auth-email-input')`

### Adding data-testid

Only add `data-testid` when semantic selectors are unreliable:

```typescript
// Component
<TextField data-testid="auth-email-input" />

// Test
await page.getByTestId('auth-email-input').fill('test@test.com');
```

**Naming convention**: `feature-element-type`

- Examples: `auth-email-input`, `profile-save-button`, `timer-scramble-text`

## Best Practices

### ✅ Do

- Use Page Object Model for all page interactions
- Follow Arrange-Act-Assert test structure
- Use semantic selectors (role, label, text)
- Add data-testid incrementally when needed
- Write descriptive test names
- One logical assertion per test
- Clean up test data in teardown

### ❌ Don't

- Don't put page logic directly in tests
- Don't use CSS selectors or XPath
- Don't use `waitForTimeout()` (use explicit waits)
- Don't share state between tests
- Don't skip teardown (keeps DB clean)
- Don't commit `.env.test` (contains secrets)

## Debugging Tests

### UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

Features:

- Interactive test runner
- Time travel debugging
- Watch mode
- Pick locators visually

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### Trace Viewer

```bash
# Run tests with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

Shows:

- Test execution timeline
- Screenshots at each step
- Network requests
- Console logs

### Codegen (Record Tests)

```bash
npx playwright codegen http://localhost:5173
```

Records interactions and generates test code.

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          VITE_SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
          E2E_USERNAME_ID: ${{ secrets.E2E_USERNAME_ID }}
          E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Secrets Configuration

Add to GitHub repository secrets:

- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_SERVICE_ROLE_KEY`
- `E2E_USERNAME_ID`
- `E2E_USERNAME`
- `E2E_PASSWORD`

## Performance Tips

1. **Enable parallel execution**: Tests run concurrently by default
2. **Use session reuse**: Skip repeated login flows
3. **Run critical tests first**: Fast feedback on failures
4. **Use `chromium` only**: Faster than multi-browser testing
5. **Optimize teardown**: Delete only what's necessary

## Troubleshooting

### Tests timeout

- Increase timeout: `test.setTimeout(60000)`
- Check if dev server is running
- Verify network requests complete

### Session not persisting

- Check `e2e/.auth/user.json` exists
- Verify auth setup completed successfully
- Ensure `storageState` path is correct in config

### Teardown fails

- Verify `VITE_SUPABASE_SERVICE_ROLE_KEY` is set
- Check network connection to Supabase
- Review error message for specific issue

### Selector not found

- Use Playwright Inspector: `npm run test:e2e:debug`
- Try `page.pause()` to inspect page state
- Add `data-testid` if semantic selector is unreliable

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)

---

**Questions or Issues?**

- Check the main E2E test plan: `.ai/e2e-test-plan.md`
- Review conclusions: `.ai/e2e-test-conclusions.md`
- Open an issue in the project repository
