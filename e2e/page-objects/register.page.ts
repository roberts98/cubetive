import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Register Page Object Model
 *
 * Handles interactions with the registration page at /register
 */
export class RegisterPage extends BasePage {
  readonly url = '/register';

  constructor(page: Page) {
    super(page);
  }

  // Locators
  private get emailInput() {
    return this.page.locator('input[id="email"]');
  }

  private get usernameInput() {
    return this.page.locator('input[id="username"]');
  }

  private get passwordInput() {
    return this.page.locator('input[id="password"]');
  }

  private get confirmPasswordInput() {
    return this.page.locator('input[id="confirmPassword"]');
  }

  private get submitButton() {
    return this.page.getByRole('button', { name: 'Sign Up' });
  }

  private get loginLink() {
    return this.page.getByRole('link', { name: 'Login' });
  }

  private get passwordStrengthIndicator() {
    return this.page.locator('[role="progressbar"]');
  }

  /**
   * Navigate to register page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForLoadState();
  }

  /**
   * Perform registration with all required fields
   */
  async register(email: string, username: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
    await this.submitButton.click();
  }

  /**
   * Fill email field only
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill username field only
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill password field only
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill confirm password field only
   */
  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Click the submit button
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * Click the "Login" link
   */
  async goToLogin() {
    await this.loginLink.click();
  }

  /**
   * Expect an error message to be displayed
   */
  async expectErrorMessage(message: string) {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(message);
  }

  /**
   * Expect a success message to be displayed
   */
  async expectSuccessMessage(message: string) {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(message);
  }

  /**
   * Expect redirect to email verification page
   */
  async expectRedirectToVerifyEmail() {
    await expect(this.page).toHaveURL('/verify-email');
  }

  /**
   * Expect submit button to be in loading state
   */
  async expectLoadingState() {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.page.getByText('Creating account...')).toBeVisible();
  }

  /**
   * Expect registration form to be visible and ready
   */
  async expectFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Expect password strength indicator to be visible
   */
  async expectPasswordStrengthVisible() {
    await expect(this.passwordStrengthIndicator).toBeVisible();
  }

  /**
   * Expect field validation error
   */
  async expectFieldError(fieldLabel: string, errorMessage: string) {
    // Find the input by label and check for error state
    const field = this.page.getByLabel(fieldLabel);
    await expect(field).toHaveAttribute('aria-invalid', 'true');

    // Check for error message in helper text
    await expect(this.page.getByText(errorMessage)).toBeVisible();
  }
}
