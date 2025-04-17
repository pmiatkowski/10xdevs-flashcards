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

  test("should fill login form with credentials", async ({ page }) => {
    // Arrange - Start from the login page
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Assert - Verify we're on the login page
    await expect(page).toHaveURL("/login");

    // Act - Fill in login credentials but don't submit
    // This tests just the field interactions
    const testEmail = "test@example.com";
    const testPassword = "securepassword123";

    await loginPage.emailInput.fill(testEmail);
    await loginPage.passwordInput.fill(testPassword);

    // Assert - Verify fields contain expected values
    await expect(loginPage.emailInput).toHaveValue(testEmail);
    await expect(loginPage.passwordInput).toHaveValue(testPassword);
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
