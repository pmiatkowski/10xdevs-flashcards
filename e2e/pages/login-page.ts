// e2e/pages/login-page.ts
import type { Page } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Login page object model
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, "/login");
  }

  // Selectors using more reliable locators
  get emailInput() {
    return this.page.getByLabel(/email/i);
  }

  get passwordInput() {
    return this.page.getByLabel(/password/i);
  }

  get loginButton() {
    return this.page.getByRole("button", { name: /sign in/i });
  }

  get forgotPasswordLink() {
    return this.page.getByRole("link", { name: /forgot your password/i });
  }

  // Actions
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL("**/forgot-password");
  }

  // Assertions
  async expectValidationError() {
    await this.page.getByText(/invalid email or password/i).isVisible();
  }

  async expectLoginSuccess() {
    await this.page.waitForURL("/", { timeout: 10000 });
  }
}
