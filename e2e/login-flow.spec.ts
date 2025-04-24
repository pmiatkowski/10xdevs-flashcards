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
    const testEmail = process.env.E2E_USERNAME || "test@example.com";
    const testPassword = process.env.E2E_PASSWORD || "password123";

    // Use the login method from the page object
    await loginPage.login(testEmail, testPassword);

    // Assert - Verify successful login
    await loginPage.expectLoginSuccess();

    // Additional assertion to ensure we're on the dashboard
    await expect(page).toHaveURL("/");

    // Verify the user's email is visible in the header using the page object method
    await expect(loginPage.userEmailDropdown).toHaveText(testEmail);
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
    // Using more specific selector that matches the validation error in the React component
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  });

  test("should show validation error for empty password", async ({ page }) => {
    // Arrange - Start from the login page
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Act - Fill email but leave password empty and submit
    await loginPage.emailInput.fill("test@example.com");
    // Clear password field to ensure it's empty
    await loginPage.passwordInput.fill("");
    await loginPage.loginButton.click();

    // Assert - Verify validation error appears
    // Using role='alert' to find the error message which is more reliable
    const errorMessage = page.getByRole("alert").filter({ hasText: /password/i });
    await expect(errorMessage).toBeVisible();

    // Additionally verify text content contains our expected message
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain("Password must be at least 4 characters");
  });
});
