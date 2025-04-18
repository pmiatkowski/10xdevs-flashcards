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
    return this.page.getByLabel("Email");
  }

  get passwordInput() {
    return this.page.getByLabel("Password");
  }

  get loginButton() {
    return this.page.getByTestId("signin-button");
  }

  get forgotPasswordLink() {
    return this.page.getByText("Forgot your password?");
  }

  get userEmailDropdown() {
    return this.page.locator('[data-test-id="user-email-dropdown-desktop"]');
  }

  // Actions
  async login(email: string, password: string) {
    await this.waitForPageLoad();
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
    await this.page.waitForURL("/");
    await this.page.waitForLoadState("networkidle");
    // Verify the user email dropdown is visible
    await expect(this.userEmailDropdown).toBeVisible({ timeout: 30000 });
  }

  async waitForPageLoad() {
    await this.page.waitForURL("**/login");
    await this.page.waitForLoadState("networkidle");
    await Promise.all([
      this.emailInput.waitFor({ state: "visible" }),
      this.passwordInput.waitFor({ state: "visible" }),
      this.loginButton.waitFor({ state: "visible" }),
    ]);
  }
}
