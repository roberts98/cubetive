import { Page, expect } from '@playwright/test';

/**
 * Base Page Object Model class
 *
 * Provides common functionality for all page objects:
 * - Navigation helpers
 * - Common element interaction methods
 * - Wait helpers
 * - Error message retrieval
 */
export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Wait for page to reach network idle state
   */
  async waitForLoadState() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click a button by its accessible name
   */
  async clickButton(name: string) {
    await this.page.getByRole('button', { name }).click();
  }

  /**
   * Fill an input field by its label
   */
  async fillInput(label: string, value: string) {
    await this.page.getByLabel(label, { exact: true }).fill(value);
  }

  /**
   * Get error message from alert
   */
  async getErrorMessage(): Promise<string | null> {
    const alert = this.page.getByRole('alert');
    if (await alert.isVisible()) {
      return alert.textContent();
    }
    return null;
  }

  /**
   * Check if an error message is displayed
   */
  async hasError(message: string): Promise<boolean> {
    const errorText = await this.getErrorMessage();
    return errorText !== null && errorText.includes(message);
  }

  /**
   * Wait for URL to match a specific path
   */
  async waitForURL(path: string) {
    await this.page.waitForURL(path);
  }

  /**
   * Expect the page to be at a specific URL
   */
  async expectURL(path: string) {
    await expect(this.page).toHaveURL(path);
  }

  /**
   * Expect text to be visible on the page
   */
  async expectTextVisible(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * Expect heading to be visible
   */
  async expectHeading(name: string) {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }
}
