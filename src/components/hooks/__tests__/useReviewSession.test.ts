import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useReviewSession } from "../useReviewSession";
import { StorageError, NoCardsAvailableError } from "@/lib/errors/reviewErrors";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock fetch
const mockFetch = vi.fn();

describe("useReviewSession", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
    });
    global.fetch = mockFetch;
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockFlashcards = [
    {
      id: "1",
      front_text: "What is TypeScript?",
      back_text: "TypeScript is a strongly typed programming language.",
      source: "manual",
      created_at: "2025-04-17T10:00:00Z",
      updated_at: "2025-04-17T10:00:00Z",
    },
    {
      id: "2",
      front_text: "What is React?",
      back_text: "React is a JavaScript library for building user interfaces.",
      source: "manual",
      created_at: "2025-04-17T10:00:00Z",
      updated_at: "2025-04-17T10:00:00Z",
    },
  ];

  it("should initialize with loading state", () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should load flashcards successfully", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    // Wait for the loading to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalCards).toBe(mockFlashcards.length);
    expect(result.current.currentCard).toBeTruthy();
  });

  it("should handle API errors", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it("should manage review state correctly", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Initially back should not be visible
    expect(result.current.isBackVisible).toBe(false);

    // Show answer
    act(() => {
      result.current.showAnswer();
    });
    expect(result.current.isBackVisible).toBe(true);

    // Rate card
    act(() => {
      result.current.handleRating(2); // Good rating
    });

    // Should move to next card and reset visibility
    expect(result.current.isBackVisible).toBe(false);
    expect(result.current.currentCardIndex).toBe(1);
  });

  it("should complete session when all cards are reviewed", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Review all cards
    for (let i = 0; i < mockFlashcards.length; i++) {
      act(() => {
        result.current.showAnswer();
        result.current.handleRating(2);
      });
    }

    expect(result.current.isSessionComplete).toBe(true);
  });

  it("should persist SR state to localStorage", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.showAnswer();
      result.current.handleRating(2);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const savedState = JSON.parse(mockLocalStorage.getItem.mock.results[0].value);
    expect(savedState).toHaveProperty("cards");
  });

  it("should throw NoCardsAvailableError when no cards are returned", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeInstanceOf(NoCardsAvailableError);
  });

  it("should handle localStorage errors", async () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error("Storage error");
    });

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeInstanceOf(StorageError);
  });
});
