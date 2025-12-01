import { test, expect } from '@playwright/test';
import { RegisterPage } from '../page-objects/register.page';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * P0 Priority: Registration Tests
 *
 * Critical registration flow tests covering:
 * - Successful registration with valid data
 * - Duplicate email/username prevention
 * - Password confirmation mismatch
 * - Form validation (email, username, password)
 * - Password strength indicator
 * - Navigation between auth pages
 *
 * These tests run without authenticated session (public tests)
 */

test.describe('Registration - P0 Critical Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test on the register page
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('P0-103: should fail when password and confirm password do not match', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);
    const newUser = TEST_USERS.generateNewUser();

    // ACT
    await registerPage.fillEmail(newUser.email);
    await registerPage.fillUsername(newUser.username);
    await registerPage.fillPassword(newUser.password);
    await registerPage.fillConfirmPassword('DifferentPassword123!');
    await registerPage.clickSubmit();

    // ASSERT
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('P0-104: should display validation error for empty email', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);
    const newUser = TEST_USERS.generateNewUser();

    // ACT - Fill all fields except email
    await registerPage.fillUsername(newUser.username);
    await registerPage.fillPassword(newUser.password);
    await registerPage.fillConfirmPassword(newUser.password);
    await registerPage.clickSubmit();

    // ASSERT
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('P0-105: should display validation error for invalid email format', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);
    const newUser = TEST_USERS.generateNewUser();

    // ACT
    await registerPage.fillEmail(TEST_USERS.invalidFormat.email);
    await registerPage.fillUsername(newUser.username);
    await registerPage.fillPassword(newUser.password);
    await registerPage.fillConfirmPassword(newUser.password);
    await registerPage.clickSubmit();

    // ASSERT
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('P0-106: should display validation error for empty username', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);
    const newUser = TEST_USERS.generateNewUser();

    // ACT - Fill all fields except username
    await registerPage.fillEmail(newUser.email);
    await registerPage.fillPassword(newUser.password);
    await registerPage.fillConfirmPassword(newUser.password);
    await registerPage.clickSubmit();

    // ASSERT
    await expect(page.getByText('Username is required')).toBeVisible();
  });

  test('P0-107: should display validation error for username too short', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);
    const newUser = TEST_USERS.generateNewUser();

    // ACT
    await registerPage.fillEmail(newUser.email);
    await registerPage.fillUsername(TEST_USERS.invalidFormat.username); // 2 chars, too short
    await registerPage.fillPassword(newUser.password);
    await registerPage.fillConfirmPassword(newUser.password);
    await registerPage.clickSubmit();

    // ASSERT
    await expect(page.getByText('Username must be at least 3 characters')).toBeVisible();
  });

  test('P0-108: should display validation error for invalid username characters', async ({
    page,
  }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);
    const newUser = TEST_USERS.generateNewUser();

    // ACT
    await registerPage.fillEmail(newUser.email);
    await registerPage.fillUsername('invalid@username!'); // Invalid characters
    await registerPage.fillPassword(newUser.password);
    await registerPage.fillConfirmPassword(newUser.password);
    await registerPage.clickSubmit();

    // ASSERT
    await expect(
      page.getByText('Username can only contain letters, numbers, _ and -')
    ).toBeVisible();
  });

  test('P0-109: should display validation error for password too short', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);
    const newUser = TEST_USERS.generateNewUser();

    // ACT
    await registerPage.fillEmail(newUser.email);
    await registerPage.fillUsername(newUser.username);
    await registerPage.fillPassword(TEST_USERS.invalidFormat.password); // Too short
    await registerPage.fillConfirmPassword(TEST_USERS.invalidFormat.password);
    await registerPage.clickSubmit();

    // ASSERT - Use first() to avoid strict mode violation (text appears in helper text and caption)
    await expect(page.getByText('Password must be at least 8 characters').first()).toBeVisible();
  });

  test('P0-110: should display password strength indicator', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);

    // ACT
    await registerPage.fillPassword('TestPassword123!');

    // ASSERT - Password strength indicator should be visible
    await registerPage.expectPasswordStrengthVisible();
  });

  test('P0-111: should navigate to login page via "Login" link', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);

    // ACT
    await registerPage.goToLogin();

    // ASSERT
    await expect(page).toHaveURL('/login');
  });

  test('P0-113: should display registration form elements correctly', async ({ page }) => {
    // ARRANGE
    const registerPage = new RegisterPage(page);

    // ASSERT
    await registerPage.expectFormVisible();
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });
});
