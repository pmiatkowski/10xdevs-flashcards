import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Flashcards page object model
 * Represents the flashcards management page
 */
export class FlashcardsPage extends BasePage {
  constructor(page: Page) {
    super(page, "/flashcards");
  }

  // Selectors using reliable locators
  get headerCreateButton() {
    // Get the Create Manually button in the header
    return this.page
      .locator("div")
      .filter({ hasText: /^Create ManuallyReview Cards$/ })
      .getByRole("button", { name: /create manually/i });
  }

  get emptyStateCreateButton() {
    // Get the Create Manually button in the empty state message
    return this.page
      .locator("div")
      .filter({ hasText: /^You don't have any flashcards yet/ })
      .getByRole("button", { name: /create manually/i });
  }

  get frontTextInput() {
    return this.page.getByLabel(/front:/i);
  }

  get backTextInput() {
    return this.page.getByLabel(/back:/i);
  }

  get saveButton() {
    // Get the Create submit button in the form (more specific selector)
    return this.page.getByRole("button", { name: "Create", exact: true }).filter({ hasText: "Create" });
  }

  get flashcardsList() {
    return this.page.getByRole("list");
  }

  get flashcardItems() {
    return this.page.getByRole("listitem");
  }

  // Actions
  async createFlashcard(front: string, back: string) {
    // Try header button first, fall back to empty state button if not visible
    const createButton = (await this.headerCreateButton.isVisible())
      ? this.headerCreateButton
      : this.emptyStateCreateButton;

    await createButton.click();

    // Wait for form inputs to be ready
    await this.frontTextInput.waitFor({ state: "visible" });
    await this.backTextInput.waitFor({ state: "visible" });
    await this.saveButton.waitFor({ state: "visible" });

    // Fill form
    await this.frontTextInput.fill(front);
    await this.backTextInput.fill(back);

    // Setup response listener before clicking save
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes("/api/flashcards") && response.request().method() === "POST"
    );

    await this.saveButton.click();

    // Wait for save to complete
    await responsePromise;
  }

  // Assertions
  async expectFlashcardPresent(front: string, back: string) {
    await expect(this.flashcardsList).toBeVisible();
    const items = await this.flashcardItems.all();
    let found = false;
    for (const item of items) {
      const text = await item.textContent();
      if (text?.includes(front) && text?.includes(back)) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  }

  async expectEmptyState() {
    await expect(this.page.getByText(/you don't have any flashcards yet/i)).toBeVisible();
  }
}
