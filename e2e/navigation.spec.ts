// e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/login-page";

test.describe("Navigation and Authentication", () => {
  test("should navigate from home to login page", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.navigate();
    await homePage.waitForPageLoad();

    // Assert
    await expect(page).toHaveURL("/");
    await expect(homePage.heading).toBeVisible();

    // Act
    await homePage.clickLogin();

    // Assert
    await expect(page).toHaveURL("/login");
  });

  test("should display validation error on incorrect login", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Assert - verify page loaded
    await expect(page).toHaveURL("/login");

    // Act - try to login with invalid credentials
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Assert - should show error message
    await loginPage.expectValidationError();
  });

  // Visual regression test example
  test("login page visual comparison", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Assert - visual comparison
    await expect(page).toHaveScreenshot("login-page.png");
  });
});
