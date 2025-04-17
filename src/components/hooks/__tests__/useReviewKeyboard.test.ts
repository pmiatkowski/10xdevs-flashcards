import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useReviewKeyboard } from "../useReviewKeyboard";

describe("useReviewKeyboard", () => {
  const showAnswer = vi.fn();
  const handleRating = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call showAnswer when space is pressed and answer is not visible", () => {
    renderHook(() =>
      useReviewKeyboard({
        isBackVisible: false,
        showAnswer,
        handleRating,
      })
    );

    // Simulate space key press
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

    expect(showAnswer).toHaveBeenCalledTimes(1);
    expect(handleRating).not.toHaveBeenCalled();
  });

  it("should not call showAnswer when space is pressed and answer is visible", () => {
    renderHook(() =>
      useReviewKeyboard({
        isBackVisible: true,
        showAnswer,
        handleRating,
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

    expect(showAnswer).not.toHaveBeenCalled();
  });

  it("should call handleRating with correct values when rating keys are pressed and answer is visible", () => {
    renderHook(() =>
      useReviewKeyboard({
        isBackVisible: true,
        showAnswer,
        handleRating,
      })
    );

    // Test number keys
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    expect(handleRating).toHaveBeenCalledWith(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
    expect(handleRating).toHaveBeenCalledWith(2);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
    expect(handleRating).toHaveBeenCalledWith(3);

    // Test letter keys
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "h" }));
    expect(handleRating).toHaveBeenCalledWith(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
    expect(handleRating).toHaveBeenCalledWith(2);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" }));
    expect(handleRating).toHaveBeenCalledWith(3);

    expect(handleRating).toHaveBeenCalledTimes(6);
  });

  it("should not call handleRating when rating keys are pressed but answer is not visible", () => {
    renderHook(() =>
      useReviewKeyboard({
        isBackVisible: false,
        showAnswer,
        handleRating,
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "h" }));

    expect(handleRating).not.toHaveBeenCalled();
  });

  it("should not handle keys when input elements are focused", () => {
    renderHook(() =>
      useReviewKeyboard({
        isBackVisible: false,
        showAnswer,
        handleRating,
      })
    );

    // Create and focus an input element
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    // Simulate key press with input focused
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

    expect(showAnswer).not.toHaveBeenCalled();
    expect(handleRating).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });
});
