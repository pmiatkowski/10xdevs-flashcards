// e2e/pages/login-page.ts
import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Login page object model
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, "/login");
  }

  // Selectors using reliable locators
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
    // Wait for redirect and make sure we're really logged in
    await this.page.waitForURL("/", { timeout: 30000 });
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });
    // Verify something that indicates we're logged in
    await expect(this.page.getByRole("button").filter({ hasText: /^.+@.+\..+$/ })).toBeVisible({ timeout: 30000 });
  }
}
