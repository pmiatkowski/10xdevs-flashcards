import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFlashcards } from "../useFlashcards";
import { flashcardsService } from "@/lib/services/flashcardsService";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";

// Mock external dependencies
vi.mock("@/lib/services/flashcardsService", () => ({
  flashcardsService: {
    getFlashcards: vi.fn(),
    createFlashcard: vi.fn(),
    updateFlashcard: vi.fn(),
    deleteFlashcard: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useFlashcards", () => {
  const mockFlashcard: FlashcardDTO = {
    id: "1",
    front_text: "Test front",
    back_text: "Test back",
    created_at: "2025-04-17T12:00:00Z",
    updated_at: "2025-04-17T12:00:00Z",
    source: "manual",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization and loading", () => {
    it("should initialize with default values and load data", async () => {
      const mockResponse = { data: [], total: 0 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useFlashcards());

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await Promise.resolve(); // wait for next tick
      });

      expect(result.current.flashcards).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.sortBy).toBe("created_at");
      expect(result.current.order).toBe("desc");
      expect(result.current.isLoading).toBe(false);
    });

    it("should load flashcards on mount", async () => {
      const mockResponse = {
        data: [mockFlashcard],
        total: 1,
      };

      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useFlashcards());

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await Promise.resolve(); // wait for next tick
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcards).toHaveLength(1);
      expect(flashcardsService.getFlashcards).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        sortBy: "created_at",
        order: "desc",
      });
    });
  });

  describe("create flashcard", () => {
    it("should create a new flashcard and update state", async () => {
      // Setup initial state
      const mockResponse = { data: [], total: 0 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);
      vi.mocked(flashcardsService.createFlashcard).mockResolvedValueOnce(mockFlashcard);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);

      // Create flashcard
      await act(async () => {
        await result.current.handleCreateFlashcard({
          front_text: "Test front",
          back_text: "Test back",
        });
      });

      expect(flashcardsService.createFlashcard).toHaveBeenCalledWith({
        front_text: "Test front",
        back_text: "Test back",
      });
      expect(result.current.flashcards[0]).toEqual({
        ...mockFlashcard,
        isEditing: false,
        editedFront: mockFlashcard.front_text,
        editedBack: mockFlashcard.back_text,
      });
      expect(result.current.totalItems).toBe(1);
      expect(toast.success).toHaveBeenCalledWith("Flashcard created successfully");
    });

    it("should handle creation errors", async () => {
      const mockResponse = { data: [], total: 0 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);
      const error = new Error("API Error");
      vi.mocked(flashcardsService.createFlashcard).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);

      // Attempt to create flashcard
      await act(async () => {
        try {
          await result.current.handleCreateFlashcard({
            front_text: "Test front",
            back_text: "Test back",
          });
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("edit flashcard", () => {
    it("should toggle edit mode", async () => {
      const mockResponse = { data: [mockFlashcard], total: 1 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcards).toHaveLength(1);

      await act(async () => {
        result.current.handleEditToggle("1", true);
      });

      const flashcard = result.current.flashcards.find((f) => f.id === "1");
      expect(flashcard?.isEditing).toBe(true);
    });

    it("should validate edit changes", async () => {
      const mockResponse = { data: [mockFlashcard], total: 1 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);

      // Enable edit mode
      await act(async () => {
        result.current.handleEditToggle("1", true);
      });

      // Change text to exceed limit
      await act(async () => {
        result.current.handleEditChange("1", "front", "a".repeat(201));
      });

      const flashcard = result.current.flashcards.find((f) => f.id === "1");
      expect(flashcard?.validationErrors?.front).toBe("Front text must be 200 characters or less");
    });

    it("should save valid edits", async () => {
      const mockResponse = { data: [mockFlashcard], total: 1 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);

      const updatedFlashcard = {
        ...mockFlashcard,
        front_text: "Updated front",
      };

      vi.mocked(flashcardsService.updateFlashcard).mockResolvedValueOnce(updatedFlashcard);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);

      // Enable edit mode and update text
      await act(async () => {
        result.current.handleEditToggle("1", true);
        result.current.handleEditChange("1", "front", "Updated front");
      });

      // Save changes
      await act(async () => {
        await result.current.handleSaveEdit("1");
      });

      expect(flashcardsService.updateFlashcard).toHaveBeenCalledWith("1", {
        front_text: "Updated front",
        back_text: mockFlashcard.back_text,
      });
      expect(toast.success).toHaveBeenCalledWith("Flashcard updated successfully");
    });
  });

  describe("delete flashcard", () => {
    it("should delete flashcard and update state", async () => {
      const mockResponse = { data: [mockFlashcard], total: 1 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);
      vi.mocked(flashcardsService.deleteFlashcard).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcards).toHaveLength(1);

      await act(async () => {
        await result.current.handleDelete("1");
      });

      expect(flashcardsService.deleteFlashcard).toHaveBeenCalledWith("1");
      expect(result.current.flashcards).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(toast.success).toHaveBeenCalledWith("Flashcard deleted successfully");
    });
  });

  describe("sorting and pagination", () => {
    it("should handle sort changes", async () => {
      const mockResponse = { data: [], total: 0 };
      vi.mocked(flashcardsService.getFlashcards).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        result.current.handleSortChange("updated_at", "asc");
      });

      expect(result.current.sortBy).toBe("updated_at");
      expect(result.current.order).toBe("asc");
      expect(result.current.currentPage).toBe(1);
    });

    it("should load new page when currentPage changes", async () => {
      const mockInitialResponse = { data: [mockFlashcard], total: 1 };
      const mockPageResponse = { data: [], total: 1 };

      vi.mocked(flashcardsService.getFlashcards)
        .mockResolvedValueOnce(mockInitialResponse)
        .mockResolvedValueOnce(mockPageResponse);

      const { result } = renderHook(() => useFlashcards());

      // Wait for initial load
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        result.current.setCurrentPage(2);
        await Promise.resolve(); // wait for loadFlashcards to be called
      });

      expect(flashcardsService.getFlashcards).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 20,
        })
      );
    });
  });
});
