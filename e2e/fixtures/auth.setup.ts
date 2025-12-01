import { test as setup, expect } from '@playwright/test';
import { TEST_USER } from './test-users';

/**
 * Authentication Setup Fixture
 *
 * This fixture runs ONCE before all tests to create an authenticated session.
 * The session is saved to a file and reused by all tests that need authentication.
 *
 * Benefits:
 * - 5-10x faster test execution (no repeated login flows)
 * - Consistent authenticated state across tests
 * - Reduces load on Supabase auth service
 *
 * Flow:
 * 1. Navigate to login page
 * 2. Enter test user credentials
 * 3. Submit login form
 * 4. Wait for redirect to dashboard (confirms successful login)
 * 5. Save authenticated session to e2e/.auth/user.json
 *
 * This session file is loaded by tests via storageState in playwright.config.ts
 */

const authFile = 'e2e/.auth/user.json';

setup('authenticate as test user', async ({ page }) => {
  console.log('🔐 Setting up authenticated session...');
  console.log(`   User: ${TEST_USER.email}`);

  // Navigate to login page
  await page.goto('/login');

  // Fill login form using input selectors
  // Material UI TextField creates nested structure, so we target the actual input
  await page.locator('input[id="email"]').fill(TEST_USER.email);
  await page.locator('input[id="password"]').fill(TEST_USER.password);

  // Submit form and wait for navigation
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for redirect to dashboard (confirms successful login)
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Verify we're logged in by checking for user email on dashboard
  await expect(page.getByText(TEST_USER.email)).toBeVisible({ timeout: 5000 });

  console.log('✅ Authentication successful');

  // Save authenticated state to file
  // This captures:
  // - Cookies (Supabase session cookies)
  // - localStorage (Supabase auth token)
  // - sessionStorage
  await page.context().storageState({ path: authFile });

  console.log(`💾 Session saved to ${authFile}`);
});
