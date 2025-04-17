// e2e/pages/home-page.ts
import { Page } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Home page object model
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page, "/"); // Home page is at root path
  }

  // Selectors as getters
  get loginButton() {
    return this.page.getByRole("link", { name: /login/i });
  }

  get registerButton() {
    return this.page.getByRole("link", { name: /register/i });
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
    await this.page.waitForURL("**/");
  }
}
