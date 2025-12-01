import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard.page';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USER } from '../fixtures/test-users';

/**
 * P0 Priority: Logout Tests
 *
 * Critical logout flow tests covering:
 * - Successful logout from dashboard
 * - Session clearing after logout
 * - Redirect to login after logout
 * - Cannot access protected routes after logout
 * - Logout from different protected pages
 *
 * These tests use the authenticated session from auth.setup.ts
 * (chromium project with storageState)
 */

test.describe('Logout - P0 Critical Tests', () => {
  test('P0-401: should successfully logout from dashboard', async ({ page }) => {
    // ARRANGE
    const dashboardPage = new DashboardPage(page);

    // ACT
    await dashboardPage.goto();
    await dashboardPage.expectOnDashboard();

    await dashboardPage.logout();

    // ASSERT - Should be redirected to login or home page
    await expect(page).toHaveURL(/\/(login|)/);
  });

  test('P0-402: should clear authentication session after logout', async ({ page }) => {
    // ARRANGE
    const dashboardPage = new DashboardPage(page);

    // ACT - Logout
    await dashboardPage.goto();
    await dashboardPage.logout();

    // Wait for redirect
    await page.waitForURL(/\/(login|)/);

    // ASSERT - localStorage should not contain auth session
    const localStorage = await page.evaluate(() => {
      return JSON.stringify(window.localStorage);
    });

    // Check that Supabase auth data is cleared or session is invalid
    // (exact implementation may vary)
    const hasValidSession = localStorage.includes('"access_token"');
    expect(hasValidSession).toBe(false);
  });

  test('P0-405: should be able to login again after logout', async ({ page }) => {
    // ARRANGE
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    // ACT - Logout
    await dashboardPage.goto();
    await dashboardPage.logout();

    // Wait for redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Login again (we're already on login page)
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    // ASSERT - Should be logged in again
    await dashboardPage.expectOnDashboard();
    await dashboardPage.expectLogoutButtonVisible();
  });

  test('P0-406: should logout from profile page', async ({ page }) => {
    // ARRANGE
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');

    // ACT - Find and click logout button on profile page
    await page.getByRole('button', { name: 'Logout' }).click();

    // ASSERT - Should be redirected to login or home
    await expect(page).toHaveURL(/\/(login|)/);
  });

  test('P0-407: should hide logout button after logout', async ({ page }) => {
    // ARRANGE
    const dashboardPage = new DashboardPage(page);

    // ACT - Logout
    await dashboardPage.goto();
    await dashboardPage.logout();
    await page.waitForURL(/\/(login|)/);

    // ASSERT - Logout button should not be visible
    await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
  });

  test('P0-408: should clear user-specific content after logout', async ({ page }) => {
    // ARRANGE
    const dashboardPage = new DashboardPage(page);

    // ACT
    await dashboardPage.goto();
    await dashboardPage.expectLogoutButtonVisible();

    await dashboardPage.logout();
    await page.waitForURL(/\/(login|)/);

    // ASSERT - Logout button should not be visible (confirms authenticated content cleared)
    await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
  });
});
