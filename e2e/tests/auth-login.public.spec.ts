import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { DashboardPage } from '../page-objects/dashboard.page';
import { TEST_USER, TEST_USERS } from '../fixtures/test-users';

/**
 * P0 Priority: Login Tests
 *
 * Critical authentication flow tests covering:
 * - Successful login with valid credentials
 * - Failed login with invalid credentials
 * - Remember me functionality
 * - Form validation
 * - Navigation between auth pages
 *
 * These tests run without authenticated session (public tests)
 */

test.describe('Login - P0 Critical Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test on the login page
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('P0-001: should successfully login with valid credentials', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // ACT
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    // ASSERT
    await dashboardPage.expectOnDashboard();
    await dashboardPage.expectUserEmail(TEST_USER.email);
  });

  test('P0-002: should fail to login with invalid email', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ACT
    await loginPage.login(TEST_USERS.invalid.email, TEST_USERS.invalid.password);

    // ASSERT
    await loginPage.expectErrorMessage('Invalid email or password');
    await expect(page).toHaveURL('/login'); // Should stay on login page
  });

  test('P0-003: should fail to login with invalid password', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ACT
    await loginPage.login(TEST_USER.email, 'WrongPassword123!');

    // ASSERT
    await loginPage.expectErrorMessage('Invalid email or password');
    await expect(page).toHaveURL('/login');
  });

  test('P0-004: should display validation error for empty email', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ACT
    await loginPage.fillPassword('SomePassword123!');
    await loginPage.clickLogin();

    // ASSERT
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('P0-005: should display validation error for empty password', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ACT
    await loginPage.fillEmail(TEST_USER.email);
    await loginPage.clickLogin();

    // ASSERT
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('P0-006: should display validation error for invalid email format', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ACT
    await loginPage.fillEmail('not-an-email');
    await loginPage.fillPassword('SomePassword123!');
    await loginPage.clickLogin();

    // ASSERT
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('P0-007: should remember user session with "Remember me" checked', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // ACT
    await loginPage.login(TEST_USER.email, TEST_USER.password, true);

    // ASSERT - User should be logged in
    await dashboardPage.expectOnDashboard();

    // Verify localStorage has session data (Supabase auth token)
    const localStorage = await page.evaluate(() => {
      return JSON.stringify(window.localStorage);
    });

    // Check for Supabase auth token key pattern (sb-{project-id}-auth-token)
    expect(localStorage).toContain('-auth-token');
    expect(localStorage).toContain('access_token');
  });

  test('P0-008: should navigate to register page via "Sign Up" link', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ACT
    await loginPage.goToRegister();

    // ASSERT
    await expect(page).toHaveURL('/register');
  });

  test('P0-009: should navigate to forgot password page via "Forgot password?" link', async ({
    page,
  }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ACT
    await loginPage.goToForgotPassword();

    // ASSERT
    await expect(page).toHaveURL('/reset-password');
  });

  test('P0-011: should display login form elements correctly', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);

    // ASSERT
    await loginPage.expectFormVisible();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('P0-012: should redirect authenticated user from login to dashboard', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // ACT - First login
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await dashboardPage.expectOnDashboard();

    // Try to navigate to login page while authenticated
    await loginPage.goto();

    // ASSERT - Should be redirected back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
