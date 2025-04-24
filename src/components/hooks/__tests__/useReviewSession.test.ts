/* eslint-disable @typescript-eslint/prefer-for-of */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useReviewSession } from "../useReviewSession";
import type { FlashcardDTO } from "@/types";

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
    // Make mock results accessible for assertions
    _getStore: () => store,
  };
})();

// Mock fetch
const mockFetch = vi.fn();

const mockFlashcards: FlashcardDTO[] = [
  {
    id: "1",
    front_text: "What is TypeScript?",
    back_text: "A typed superset of JavaScript",
    source: "manual",
    created_at: "2025-04-23T12:00:00Z",
    updated_at: "2025-04-23T12:00:00Z",
  },
  {
    id: "2",
    front_text: "What is React?",
    back_text: "A JavaScript library for building user interfaces",
    source: "manual",
    created_at: "2025-04-23T12:00:00Z",
    updated_at: "2025-04-23T12:00:00Z",
  },
];

describe("useReviewSession", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    global.fetch = mockFetch;
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    // Check initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for loading to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.totalCards).toBe(mockFlashcards.length);
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
      await Promise.resolve();
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
      await Promise.resolve();
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

  it("should prevent showing answer after session completion", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await Promise.resolve();
    });

    // Complete the session
    for (let i = 0; i < mockFlashcards.length; i++) {
      act(() => {
        result.current.showAnswer();
        result.current.handleRating(2);
      });
    }

    // Try to show answer after completion
    act(() => {
      result.current.showAnswer();
    });

    expect(result.current.isBackVisible).toBe(false);
    expect(result.current.isSessionComplete).toBe(true);
  });

  it("should prevent rating without showing answer first", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFlashcards }),
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await Promise.resolve();
    });

    const initialIndex = result.current.currentCardIndex;

    // Try to rate without showing answer
    act(() => {
      result.current.handleRating(2);
    });

    // Should not advance to next card
    expect(result.current.currentCardIndex).toBe(initialIndex);
  });

  it("should shuffle cards on initialization", async () => {
    const manyFlashcards = Array.from({ length: 20 }, (_, i) => ({
      ...mockFlashcards[0],
      id: String(i + 1),
      front_text: `Card ${i + 1}`,
    }));

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: manyFlashcards }),
      })
    );

    // Run multiple sessions to verify shuffling
    const sessions = [];
    for (let i = 0; i < 5; i++) {
      const { result } = renderHook(() => useReviewSession());
      await act(async () => {
        await Promise.resolve();
      });
      sessions.push(result.current);
    }

    // Check if at least one pair of sessions has different card orders
    const ordersAreDifferent = sessions.some((session1, i) =>
      sessions.slice(i + 1).some((session2) => {
        const firstCard1 = session1.currentCard;
        const firstCard2 = session2.currentCard;
        return firstCard1 && firstCard2 && firstCard1.id !== firstCard2.id;
      })
    );

    expect(ordersAreDifferent).toBe(true);
  });

  it("should handle API errors gracefully", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Failed to load flashcards");
  });

  it("should handle network errors gracefully", async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error("Network error")));

    const { result } = renderHook(() => useReviewSession());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Failed to load flashcards");
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
      await Promise.resolve();
    });

    // Mock what gets saved to localStorage
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      mockLocalStorage._getStore()[key] = value;
    });

    act(() => {
      result.current.showAnswer();
      result.current.handleRating(2);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    // Check that something was actually saved
    const storageKey = Object.keys(mockLocalStorage._getStore())[0];
    expect(storageKey).toBeTruthy();

    // Verify we can parse the stored value and it has the expected structure
    if (storageKey) {
      const savedState = JSON.parse(mockLocalStorage._getStore()[storageKey]);
      expect(savedState).toHaveProperty("cards");
    }
  });
});
