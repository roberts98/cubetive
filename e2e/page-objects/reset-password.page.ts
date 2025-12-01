import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Reset Password Page Object Model
 *
 * Handles interactions with the password reset request page at /reset-password
 */
export class ResetPasswordPage extends BasePage {
  readonly url = '/reset-password';

  constructor(page: Page) {
    super(page);
  }

  // Locators
  private get emailInput() {
    return this.page.locator('input[id="email"]');
  }

  private get submitButton() {
    return this.page.getByRole('button', { name: 'Send Reset Instructions' });
  }

  private get loginLink() {
    return this.page.getByRole('link', { name: 'Login' });
  }

  /**
   * Navigate to reset password page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForLoadState();
  }

  /**
   * Request password reset for an email
   */
  async requestPasswordReset(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /**
   * Fill email field only
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
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
   * Expect a success message to be displayed
   */
  async expectSuccessMessage(message: string) {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(message);
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
   * Expect submit button to be in loading state
   */
  async expectLoadingState() {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.page.getByText('Sending...')).toBeVisible();
  }

  /**
   * Expect form to be visible and ready
   */
  async expectFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}

/**
 * Update Password Page Object Model
 *
 * Handles interactions with the update password page at /update-password
 */
export class UpdatePasswordPage extends BasePage {
  readonly url = '/update-password';

  constructor(page: Page) {
    super(page);
  }

  // Locators
  private get passwordInput() {
    return this.page.locator('input[id="password"]');
  }

  private get confirmPasswordInput() {
    return this.page.locator('input[id="confirmPassword"]');
  }

  private get submitButton() {
    return this.page.getByRole('button', { name: 'Update Password' });
  }

  /**
   * Navigate to update password page (requires token in URL)
   */
  async goto(token?: string) {
    const url = token ? `${this.url}?token=${token}` : this.url;
    await super.goto(url);
    await this.waitForLoadState();
  }

  /**
   * Update password with new password
   */
  async updatePassword(password: string, confirmPassword?: string) {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
    await this.submitButton.click();
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
   * Expect a success message to be displayed
   */
  async expectSuccessMessage(message: string) {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(message);
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
   * Expect redirect to login page after successful update
   */
  async expectRedirectToLogin() {
    await expect(this.page).toHaveURL('/login');
  }

  /**
   * Expect submit button to be in loading state
   */
  async expectLoadingState() {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.page.getByText('Updating password...')).toBeVisible();
  }

  /**
   * Expect form to be visible and ready
   */
  async expectFormVisible() {
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
