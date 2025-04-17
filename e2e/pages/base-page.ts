// e2e/pages/base-page.ts
import { Locator, Page } from "@playwright/test";

/**
 * Base Page class that all Page Objects will inherit from
 */
export class BasePage {
  /**
   * @param page Playwright page
   * @param path The path part of the URL (e.g., '/' for home)
   */
  constructor(
    protected page: Page,
    protected path = "/"
  ) {}

  /**
   * Navigate to the page
   */
  async navigate() {
    await this.page.goto(this.path);
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
