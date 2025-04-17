// e2e/pages/login-page.ts
import { Page } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Login page object model
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, "/login");
  }

  // Selectors
  get emailInput() {
    return this.page.getByLabel("Email");
  }

  get passwordInput() {
    return this.page.getByLabel("Password");
  }

  get loginButton() {
    return this.page.getByRole("button", { name: /sign in|login/i });
  }

  get forgotPasswordLink() {
    return this.page.getByRole("link", { name: /forgot password/i });
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
    await this.page.waitForURL("**/flashcards", { timeout: 10000 });
  }
}
