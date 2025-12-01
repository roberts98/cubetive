import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard Page Object Model
 *
 * Handles interactions with the dashboard page at /dashboard
 */
export class DashboardPage extends BasePage {
  readonly url = '/dashboard';

  constructor(page: Page) {
    super(page);
  }

  // Locators
  private get logoutButton() {
    return this.page.getByRole('button', { name: 'Logout' });
  }

  private get profileLink() {
    return this.page.getByRole('link', { name: /Profile/i });
  }

  /**
   * Navigate to dashboard page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForLoadState();
  }

  /**
   * Click logout button
   */
  async logout() {
    await this.logoutButton.click();
  }

  /**
   * Navigate to profile page
   */
  async goToProfile() {
    await this.profileLink.click();
  }

  /**
   * Expect to be on dashboard page
   */
  async expectOnDashboard() {
    await expect(this.page).toHaveURL(this.url);
    await expect(this.page.getByRole('heading', { name: /Performance Analytics/i })).toBeVisible();
  }

  /**
   * Expect user email to be visible (confirms logged in state)
   */
  async expectUserEmail(email: string) {
    await expect(this.page.getByText(email)).toBeVisible();
  }

  /**
   * Expect logout button to be visible
   */
  async expectLogoutButtonVisible() {
    await expect(this.logoutButton).toBeVisible();
  }

  /**
   * Expect profile link to be visible
   */
  async expectProfileLinkVisible() {
    await expect(this.profileLink).toBeVisible();
  }
}
