# Tech Stack Decision - Cubetive MVP

## Chosen Stack (Updated 2025-12-01)

**Frontend:**

- React 19 with React Compiler (babel-plugin-react-compiler)
- TypeScript 5.9
- Vite (rolldown-vite 7.2.5)
- Material UI 7.3.5
- React Router 7.9.6
- React Hook Form 7.67.0 + Zod 4.1.13
- Zustand 5.0.9 (state management)
- react-toastify 11.0.5 (notifications)
- cubing 0.56.0 (scramble generation)

**Backend:**

- Supabase 2.86.0 (Database + Auth + Real-time + Auto-generated API)

**Testing:**

- Vitest 4 (unit test runner)
- React Testing Library 16 (component testing)
- happy-dom 20 (lightweight DOM for testing)
- Playwright 1.57.0 (E2E testing)

**Hosting & CI/CD:**

- Vercel (frontend hosting)
- GitHub Actions (CI/CD)
- Husky 9 (pre-commit hooks)

## Rationale

### Why This Stack?

1. **Speed to MVP**: Supabase provides built-in auth, email verification, database, and auto-generated REST API - eliminating need for custom backend
2. **Lower Complexity**: Direct frontend-to-Supabase connection reduces code by ~50% vs NestJS approach
3. **Cost Effective**: $0-20/month vs $40-50/month with separate backend hosting
4. **Better Security**: Row Level Security (RLS) at database level reduces attack surface
5. **Simpler Deployment**: Git push deploys vs managing servers

### What We're NOT Using (and Why)

**NestJS** - Removed because:

- Application is 90% frontend (timer, scrambles, stats calculations are client-side)
- Backend needs are simple CRUD operations that Supabase handles automatically
- Would add unnecessary complexity, deployment overhead, and maintenance burden
- No complex business logic that requires custom API layer

**Digital Ocean** - Replaced with Vercel because:

- Simpler deployment (automatic from Git)
- Better developer experience
- Adequate for MVP scale
- Lower cost for initial phase

## Architecture

```
User → React App (Vercel) → Supabase (DB + Auth + API)
```

### Key Implementation Details

- Frontend uses `@supabase/supabase-js` for direct database access
- Row Level Security (RLS) policies enforce authorization
- Real-time subscriptions for live updates (if needed)
- Supabase Edge Functions for any future server-side logic

## Statistics Calculation Architecture

**Decision (2025-11-29):** Keep all statistics calculations client-side.

### Why Client-Side?

After evaluating Astro backend, Supabase Edge Functions, and client-side approaches:

1. **Calculations are trivially simple** - Ao5/Ao12/Ao100 are O(1) fixed-window operations
2. **Data volumes are small** - Only 100 solves needed for all current statistics (~15KB)
3. **No competitive features** - Personal tracking doesn't require server-authoritative validation
4. **Correctness is a testing problem** - Solved with comprehensive unit tests, not server architecture

### Why NOT Astro?

Astro was considered as a backend layer but rejected because:

- Astro is an SSR/static site framework, not an API backend framework
- Would add deployment complexity (monorepo, two services) without benefit
- Adds ~50-100ms latency per operation with no computational advantage
- The calculations don't need server-side compute power

### Implementation

Statistics module at `src/lib/statistics/`:

- `types.ts` - TypeScript interfaces (Solve, AverageResult, PersonalBests)
- `penalties.ts` - DNF/+2 effective time calculation
- `averages.ts` - Ao5, Ao12, Ao100 calculation with WCA rules
- `personalBests.ts` - PB detection and comparison

Data flow:

```
Timer stops → Local state update → Calculate stats (O(1)) → Display instantly
           → Async: INSERT to Supabase → If new PB: UPDATE profiles
```

## Migration Path

If complexity increases, we can add layers incrementally:

1. **Phase 1 (Current)**: React + Supabase (client-side calculations)
2. **Phase 2**: Add Supabase Edge Functions for competitive features (leaderboards, real-time battles)
3. **Phase 3**: Consider dedicated backend only if Edge Functions prove insufficient

## Decision Date

2025-11-24

## Testing Strategy

**Decision (2025-11-30):** Comprehensive testing approach with emphasis on unit tests and integration tests.

### Why This Testing Stack?

1. **Vitest over Jest**:
   - Native ESM support (matches Vite build system)
   - 10x faster than Jest for our use case
   - Better TypeScript integration
   - Compatible with React Testing Library

2. **React Testing Library**:
   - User-centric testing approach
   - Encourages testing behavior over implementation
   - Industry standard for React component testing

3. **happy-dom over jsdom**:
   - 2-3x faster test execution
   - Lighter memory footprint
   - Sufficient for our DOM testing needs

### Test Coverage Targets

- **Unit Tests**: >80% coverage for business logic
  - Custom hooks (useAsync, useProfile, useAuth, etc.)
  - Service layer (authService, profileService)
  - Statistics calculations (Ao5, Ao12, Ao100)
  - Validation utilities

- **Integration Tests**: All critical workflows
  - Authentication flows (registration, login, password reset)
  - Timer and solve recording
  - Profile management
  - Supabase integration

- **E2E Tests**: All user stories from PRD
  - Complete user journeys
  - Cross-browser compatibility
  - Performance validation

- **Security Tests**: 100% RLS policy coverage
  - Row Level Security enforcement
  - Authentication/authorization
  - Input validation

### Current Test Status

**Implemented** (Phase 1):

- ✅ Test infrastructure setup (Vitest + React Testing Library)
- ✅ useAsync hook - 13 test cases, 100% coverage
- ✅ profileService.getCurrentUserProfile - 7 test cases, 100% coverage
- ✅ Pre-commit hooks with Husky

**In Progress** (Phase 2):

- 🚧 Auth service tests
- 🚧 Auth hook tests
- 🚧 Component tests for auth forms
- 🚧 Integration tests for authentication flow

**Planned** (Phase 3-7):

- 📋 Statistics calculation tests
- 📋 Timer accuracy tests
- 📋 E2E tests with Playwright/Cypress
- 📋 Performance and accessibility tests

### Why NOT Other Testing Tools?

**Jest** - Not chosen because:

- Slower than Vitest for Vite-based projects
- Requires additional configuration for ESM
- Vitest provides better DX with Vite

**jsdom** - Replaced with happy-dom because:

- happy-dom is 2-3x faster
- Lighter memory usage
- Sufficient DOM implementation for our needs

**Testing Library alternatives** - Not considered because:

- React Testing Library is the industry standard
- Excellent documentation and community support
- Encourages best practices (testing behavior, not implementation)

### CI/CD Integration

Tests run automatically:

- **Pre-commit**: Lint, format, type-check, unit tests (via Husky)
- **Pull Request**: Full test suite + coverage report
- **Main branch**: Full test suite + deployment checks
- **Pre-deployment**: Smoke tests on staging environment

For detailed test scenarios and schedules, see [TEST_PLAN.md](TEST_PLAN.md).

## Reviewed Against PRD

All MVP requirements can be met with this simplified stack:

- ✅ Timer functionality (client-side React)
- ✅ Authentication & email verification (Supabase Auth)
- ✅ Statistics calculation (client-side)
- ✅ Data persistence (Supabase DB)
- ✅ Public profiles (Supabase RLS + simple queries)
- ✅ Performance requirements (<100ms timer, <3s page load)
- ✅ Security requirements (RLS, built-in auth)
- ✅ Testing requirements (unit, integration, E2E, security)
