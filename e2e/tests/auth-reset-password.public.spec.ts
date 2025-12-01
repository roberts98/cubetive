import { test, expect } from '@playwright/test';
import { ResetPasswordPage } from '../page-objects/reset-password.page';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USER, TEST_USERS } from '../fixtures/test-users';

/**
 * P0 Priority: Password Reset Tests
 *
 * Critical password reset flow tests covering:
 * - Request password reset email
 * - Validation errors for reset request
 * - Navigation between auth pages
 * - Success message display
 *
 * Note: Complete password reset flow (receiving email, clicking link, updating password)
 * cannot be fully tested in E2E due to email verification being disabled in test environment.
 * These tests focus on the request flow and validation.
 *
 * These tests run without authenticated session (public tests)
 */

test.describe('Password Reset - P0 Critical Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test on the reset password page
    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.goto();
  });

  test('P0-201: should successfully request password reset for valid email', async ({ page }) => {
    // ARRANGE
    const resetPasswordPage = new ResetPasswordPage(page);

    // ACT
    await resetPasswordPage.requestPasswordReset(TEST_USER.email);

    // ASSERT - Should show success message
    await resetPasswordPage.expectSuccessMessage('check your inbox');
  });

  test('P0-202: should show success message even for non-existent email (security)', async ({
    page,
  }) => {
    // ARRANGE
    const resetPasswordPage = new ResetPasswordPage(page);

    // ACT - Request reset for non-existent email
    await resetPasswordPage.requestPasswordReset(TEST_USERS.invalid.email);

    // ASSERT - Should show generic success message (prevents email enumeration)
    await resetPasswordPage.expectSuccessMessage('check your inbox');
  });

  test('P0-203: should display validation error for empty email', async ({ page }) => {
    // ARRANGE
    const resetPasswordPage = new ResetPasswordPage(page);

    // ACT
    await resetPasswordPage.clickSubmit();

    // ASSERT
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('P0-204: should display validation error for invalid email format', async ({ page }) => {
    // ARRANGE
    const resetPasswordPage = new ResetPasswordPage(page);

    // ACT
    await resetPasswordPage.fillEmail(TEST_USERS.invalidFormat.email);
    await resetPasswordPage.clickSubmit();

    // ASSERT
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('P0-205: should navigate to login page via "Login" link', async ({ page }) => {
    // ARRANGE
    const resetPasswordPage = new ResetPasswordPage(page);

    // ACT
    await resetPasswordPage.goToLogin();

    // ASSERT
    await expect(page).toHaveURL('/login');
  });

  test('P0-207: should display reset password form elements correctly', async ({ page }) => {
    // ARRANGE
    const resetPasswordPage = new ResetPasswordPage(page);

    // ASSERT
    await resetPasswordPage.expectFormVisible();
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
    await expect(
      page.getByText("Enter your email address and we'll send you instructions")
    ).toBeVisible();
  });

  test('P0-209: should navigate from login to reset password and back', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);
    const resetPasswordPage = new ResetPasswordPage(page);

    // ACT - Start at login, go to reset password
    await loginPage.goto();
    await loginPage.goToForgotPassword();

    // ASSERT - Should be on reset password page
    await expect(page).toHaveURL('/reset-password');

    // ACT - Go back to login
    await resetPasswordPage.goToLogin();

    // ASSERT - Should be back on login page
    await expect(page).toHaveURL('/login');
  });
});
