/* eslint-disable no-console */
// e2e/login-flow.spec.ts
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/login-page";

test.describe("Authentication Flow", () => {
  test("should navigate from home to login page", async ({ page }) => {
    // Arrange - Start from the home page
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForPageLoad();

    // Assert - Verify we're on the home page
    await expect(page).toHaveURL("/");

    // Act - Click on the Sign In link
    await homePage.clickLogin();

    // Assert - Verify we're on the login page
    await expect(page).toHaveURL("/login");

    // Assert - Verify login form is visible
    const loginPage = new LoginPage(page);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("should fill login form with credentials and successfully sign in", async ({ page }) => {
    // Enable debug logs
    page.on("console", (msg) => console.log(`Browser console: ${msg.text()}`));
    page.on("pageerror", (err) => console.error(`Browser error: ${err}`));

    // Arrange - Start from the login page
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Assert - Verify we're on the login page
    await expect(page).toHaveURL("/login");

    // Act - Fill in login credentials and submit the form
    const testEmail = `${process.env.E2E_USERNAME}`;
    const testPassword = `${process.env.E2E_PASSWORD}`;

    // Use the login method from the page object
    await loginPage.login(testEmail, testPassword);

    // Assert - Verify successful login
    await loginPage.expectLoginSuccess();

    // Additional assertion to ensure we're on the dashboard
    await expect(page).toHaveURL("/");

    // Verify the user's email is visible in the header
    await expect(page.locator('[data-test-id="user-email-dropdown-desktop"]')).toHaveText(testEmail);
  });

  test("should show validation error for invalid email", async ({ page }) => {
    // Arrange - Start from the login page
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Act - Fill invalid email and submit
    await loginPage.emailInput.fill("invalid-email");
    await loginPage.passwordInput.fill("password123");
    await loginPage.loginButton.click();

    // Assert - Verify validation error appears
    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible();
  });

  test("should show validation error for empty password", async ({ page }) => {
    // Arrange - Start from the login page
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Act - Fill email but leave password empty and submit
    await loginPage.emailInput.fill("test@example.com");
    await loginPage.loginButton.click();

    // Assert - Verify validation error appears
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });
});
