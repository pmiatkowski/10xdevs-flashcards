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
    return this.page.locator('a[href="/login"]');
  }

  get registerButton() {
    return this.page.locator('a[href="/register"]');
  }

  get userEmailDropdown() {
    return this.page.getByRole("button").filter({ hasText: /^.+@.+\..+$/ });
  }

  get heading() {
    return this.page.getByRole("heading", { level: 1 });
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
