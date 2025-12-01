import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Login Page Object Model
 *
 * Handles interactions with the login page at /login
 */
export class LoginPage extends BasePage {
  readonly url = '/login';

  constructor(page: Page) {
    super(page);
  }

  // Locators
  private get emailInput() {
    return this.page.locator('input[id="email"]');
  }

  private get passwordInput() {
    return this.page.locator('input[id="password"]');
  }

  private get rememberMeCheckbox() {
    return this.page.getByRole('checkbox', { name: /Remember me/i });
  }

  private get submitButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  private get registerLink() {
    return this.page.getByRole('link', { name: 'Sign Up' });
  }

  private get forgotPasswordLink() {
    return this.page.getByRole('link', { name: 'Forgot password?' });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForLoadState();
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.submitButton.click();
  }

  /**
   * Fill email field only
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field only
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login button
   */
  async clickLogin() {
    await this.submitButton.click();
  }

  /**
   * Check the remember me checkbox
   */
  async checkRememberMe() {
    await this.rememberMeCheckbox.check();
  }

  /**
   * Click the "Sign Up" link
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Click the "Forgot password?" link
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
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
   * Expect redirect to dashboard after successful login
   */
  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL('/dashboard');
  }

  /**
   * Expect login button to be in loading state
   */
  async expectLoadingState() {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.page.getByText('Logging in...')).toBeVisible();
  }

  /**
   * Expect login form to be visible and ready
   */
  async expectFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
