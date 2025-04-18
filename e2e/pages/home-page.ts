// e2e/pages/home-page.ts
import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Home page object model
 * Represents the main landing page of the application
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page, "/"); // Home page is at root path
  }

  // Selectors as getters
  get loginButton() {
    return this.page.locator('[data-test-id="signin-link-desktop"]').first();
  }

  get registerButton() {
    return this.page.locator('[data-test-id="signup-link"]').first();
  }

  get userEmailDropdown() {
    return this.page.locator('[data-test-id="user-email-dropdown-desktop"]');
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 }).filter({ hasText: "AI Flashcard Generator" });
  }

  // Actions
  async clickLogin() {
    await this.loginButton.click();
    await this.page.waitForURL("**/login");
  }

  async clickRegister() {
    await this.registerButton.click();
    await this.page.waitForURL("**/register");
  }

  // Assertions
  async expectPageLoaded() {
    await this.heading.isVisible();
    await this.page.waitForURL("/");
  }

  async expectUserLoggedIn(email: string) {
    const userEmailElement = this.userEmailDropdown;
    await userEmailElement.isVisible();
    await expect(userEmailElement).toContainText(email);
  }
}
