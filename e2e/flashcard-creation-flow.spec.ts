import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/login-page";
import { FlashcardsPage } from "./pages/flashcards-page";

test.describe("Flashcard Creation Flow", () => {
  // Increase timeout to 2 minutes for the entire test
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    // Enable request logging
    page.on("request", (request) => console.log(`>>> ${request.method()} ${request.url()}`));
    page.on("response", (response) => console.log(`<<< ${response.status()} ${response.url()}`));

    // Enable console logging
    page.on("console", (msg) => {
      const args = msg.args();
      Promise.all(args.map((arg) => arg.jsonValue()))
        .then((args) => console.log("Browser console:", ...args))
        .catch((error) => console.error("Failed to get console args:", error));
    });

    // Log page errors
    page.on("pageerror", (error) => console.error("Browser page error:", error));
  });

  test("should create a flashcard after login and verify it exists", async ({ page }) => {
    // Arrange - Setup page objects
    const loginPage = new LoginPage(page);
    const flashcardsPage = new FlashcardsPage(page);

    // Step 1: Login
    console.log("Starting login process...");
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    const testEmail = `${process.env.E2E_USERNAME}`;
    const testPassword = `${process.env.E2E_PASSWORD}`;

    // Ensure form is ready
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();

    // Login and wait for success
    await loginPage.login(testEmail, testPassword);
    await loginPage.expectLoginSuccess();

    // Verify login success by checking for user email in header
    await expect(page.locator("header").getByText(testEmail)).toBeVisible();

    // Step 2: Navigate to Flashcards
    console.log("Navigating to flashcards page...");
    await page.click('a[href="/flashcards"]');
    await expect(page).toHaveURL("/flashcards");
    await flashcardsPage.waitForPageLoad();

    // Optional: Clear any existing flashcards if needed for test isolation
    if (await flashcardsPage.flashcardsList.isVisible()) {
      // Take note of initial state
      console.log("Found existing flashcards");
    } else {
      console.log("No existing flashcards found");
      await flashcardsPage.expectEmptyState();
    }

    // Step 3: Create Flashcard
    console.log("Creating new flashcard...");
    const frontText = "What is the capital of France?";
    const backText = "Paris";
    await flashcardsPage.createFlashcard(frontText, backText);

    // Step 4: Verify Creation
    console.log("Verifying flashcard presence...");
    await flashcardsPage.expectFlashcardPresent(frontText, backText);

    // Step 5: Verify Persistence
    console.log("Verifying persistence...");
    await page.reload();
    await flashcardsPage.waitForPageLoad();
    await flashcardsPage.expectFlashcardPresent(frontText, backText);
  });
});
