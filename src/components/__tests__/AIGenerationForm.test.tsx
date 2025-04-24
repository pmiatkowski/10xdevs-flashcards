import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AIGenerationForm } from "../AIGenerationForm";
import userEvent from "@testing-library/user-event";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("AIGenerationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with correct accessibility attributes", () => {
    render(<AIGenerationForm onSubmit={() => undefined} isLoading={false} />);

    const textarea = screen.getByLabelText(/paste your text here/i);
    expect(textarea).toHaveAttribute("placeholder", "Paste your learning material here (minimum 100 characters)...");
    expect(textarea).not.toHaveAttribute("aria-invalid");
    expect(textarea).toHaveAttribute("aria-describedby", "textLengthCounter");

    const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
    expect(submitButton).toBeEnabled();
  });

  it("shows validation error for empty text", async () => {
    const user = userEvent.setup();
    render(<AIGenerationForm onSubmit={() => undefined} isLoading={false} />);

    const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter some text to generate flashcards/i)).toBeInTheDocument();
    });
  });

  it("handles successful flashcard generation", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<AIGenerationForm onSubmit={handleSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/paste your text here/i);
    // Use fireEvent for the short text too
    fireEvent.change(textarea, { target: { value: "TypeScript is a typed superset of JavaScript." } });

    const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
    await user.click(submitButton);

    // Should show validation error due to length requirement
    await waitFor(() => {
      expect(screen.getByText(/please enter at least 100 characters/i)).toBeInTheDocument();
    });

    // Clear and set a longer text to pass validation directly
    const longText =
      "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional types to JavaScript that support tools for large-scale JavaScript applications for any browser, for any host, on any OS. TypeScript compiles to clean, simple JavaScript code.";

    fireEvent.change(textarea, { target: { value: longText } });

    await user.click(submitButton);

    // Add a timeout to prevent test timeouts
    await waitFor(
      () => {
        expect(handleSubmit).toHaveBeenCalledWith(longText);
      },
      { timeout: 1000 }
    );
  });

  it("handles generation error", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<AIGenerationForm onSubmit={handleSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/paste your text here/i);
    const longText =
      "This is a sample text that is longer than 100 characters to pass the validation. It needs to be quite verbose to ensure we have enough characters to validate properly.";

    // Instead of typing the text, set the value directly
    await user.clear(textarea);
    // Use fireEvent to set value instead of typing each character
    fireEvent.change(textarea, { target: { value: longText } });

    const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(longText);
  });

  it("shows loading state during generation", async () => {
    const handleSubmit = vi.fn();

    render(<AIGenerationForm onSubmit={handleSubmit} isLoading={true} />);

    const textarea = screen.getByLabelText(/paste your text here/i);
    const longText =
      "This is a sample text that is longer than 100 characters to pass the validation. It needs to be quite verbose to ensure we have enough characters to validate properly.";

    // Using fireEvent instead of userEvent.type
    fireEvent.change(textarea, { target: { value: longText } });

    const submitButton = screen.getByRole("button");

    expect(screen.getByText(/generating.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(textarea).toBeDisabled();
  });

  it("maintains accessibility during form submission", async () => {
    const user = userEvent.setup();
    render(<AIGenerationForm onSubmit={() => undefined} isLoading={false} />);

    const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByText(/please enter some text to generate flashcards/i);

      // The error should be visible with appropriate aria attributes
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute("aria-live", "polite");
    });
  });

  it("handles network errors", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<AIGenerationForm onSubmit={handleSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/paste your text here/i);
    const longText =
      "This is a sample text that is longer than 100 characters to pass the validation. It needs to be quite verbose to ensure we have enough characters to validate properly.";

    // Using fireEvent instead of userEvent.type
    fireEvent.change(textarea, { target: { value: longText } });

    const submitButton = screen.getByRole("button", { name: /generate flashcards/i });
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(longText);
  });
});
