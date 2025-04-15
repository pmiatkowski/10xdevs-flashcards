import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/apiUtils";
import { flashcardsService } from "@/lib/services/flashcardsService";
import type { FlashcardDTO } from "@/types";

interface UseFlashcardsOptions {
  limit?: number;
  initialSortBy?: "created_at" | "updated_at";
  initialOrder?: "asc" | "desc";
}

interface FlashcardViewModel extends FlashcardDTO {
  isEditing: boolean;
  editedFront: string;
  editedBack: string;
  validationErrors?: { front?: string; back?: string };
  isSaving?: boolean;
}

export function useFlashcards(options: UseFlashcardsOptions = {}) {
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState<"created_at" | "updated_at">(options.initialSortBy || "created_at");
  const [order, setOrder] = useState<"asc" | "desc">(options.initialOrder || "desc");
  const [isCreating, setIsCreating] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const loadFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * (options.limit || 20);
      const { data: flashcardsData, total } = await flashcardsService.getFlashcards({
        limit: options.limit || 20,
        offset,
        sortBy,
        order,
      });

      setFlashcards(
        flashcardsData.map((flashcard) => ({
          ...flashcard,
          isEditing: false,
          editedFront: flashcard.front_text,
          editedBack: flashcard.back_text,
        }))
      );
      setTotalItems(total);
    } catch (error) {
      const errorMessage = formatApiError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, options.limit, sortBy, order]);

  const handleCreateFlashcard = useCallback(
    async (data: { front_text: string; back_text: string }) => {
      setIsCreating(true);

      try {
        const response = await flashcardsService.createFlashcard(data);

        // Add new flashcard to the list if we're on the first page
        if (currentPage === 1) {
          setFlashcards((prev) => [
            {
              ...response,
              isEditing: false,
              editedFront: response.front_text,
              editedBack: response.back_text,
            },
            ...prev,
          ]);
        }

        // Update total count
        setTotalItems((prev) => prev + 1);

        // Reset form state
        setIsFormVisible(false);
        toast.success("Flashcard created successfully");
      } catch (error) {
        const errorMessage = formatApiError(error);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [currentPage]
  );

  const handleEditToggle = useCallback((flashcardId: string, isEditing: boolean) => {
    setFlashcards((prev) =>
      prev.map((f) => {
        if (f.id === flashcardId) {
          if (isEditing) {
            return {
              ...f,
              isEditing,
              editedFront: f.front_text,
              editedBack: f.back_text,
              validationErrors: undefined,
            };
          }
          return { ...f, isEditing };
        }
        return f;
      })
    );
  }, []);

  const handleEditChange = useCallback((flashcardId: string, field: "front" | "back", value: string) => {
    setFlashcards((prev) =>
      prev.map((f) => {
        if (f.id === flashcardId) {
          const updatedFlashcard = {
            ...f,
            [field === "front" ? "editedFront" : "editedBack"]: value,
          };

          const validationErrors = { ...f.validationErrors };

          if (field === "front" && value.length > 200) {
            validationErrors.front = "Front text must be 200 characters or less";
          } else if (field === "front") {
            delete validationErrors.front;
          }

          if (field === "back" && value.length > 500) {
            validationErrors.back = "Back text must be 500 characters or less";
          } else if (field === "back") {
            delete validationErrors.back;
          }

          return {
            ...updatedFlashcard,
            validationErrors: Object.keys(validationErrors).length > 0 ? validationErrors : undefined,
          };
        }
        return f;
      })
    );
  }, []);

  const handleSaveEdit = useCallback(
    async (flashcardId: string) => {
      const flashcard = flashcards.find((f) => f.id === flashcardId);
      if (!flashcard) return;

      setFlashcards((prev) => prev.map((f) => (f.id === flashcardId ? { ...f, isSaving: true } : f)));

      try {
        const response = await flashcardsService.updateFlashcard(flashcardId, {
          front_text: flashcard.editedFront,
          back_text: flashcard.editedBack,
        });

        setFlashcards((prev) =>
          prev.map((f) =>
            f.id === flashcardId
              ? {
                  ...f,
                  ...response,
                  isEditing: false,
                  isSaving: false,
                  editedFront: response.front_text,
                  editedBack: response.back_text,
                  validationErrors: undefined,
                }
              : f
          )
        );

        toast.success("Flashcard updated successfully");
      } catch (error) {
        const errorMessage = formatApiError(error);
        toast.error(errorMessage);
        setFlashcards((prev) => prev.map((f) => (f.id === flashcardId ? { ...f, isSaving: false } : f)));
      }
    },
    [flashcards]
  );

  const handleDelete = useCallback(async (flashcardId: string) => {
    try {
      await flashcardsService.deleteFlashcard(flashcardId);
      setFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));
      setTotalItems((prev) => prev - 1);
      toast.success("Flashcard deleted successfully");
    } catch (error) {
      const errorMessage = formatApiError(error);
      toast.error(errorMessage);
    }
  }, []);

  const handleSortChange = useCallback((newSortBy: "created_at" | "updated_at", newOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, []);

  // Automatycznie ładuj dane przy pierwszym renderowaniu i przy zmianie parametrów
  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  return {
    flashcards,
    isLoading,
    error,
    currentPage,
    totalItems,
    sortBy,
    order,
    isCreating,
    isFormVisible,
    setCurrentPage,
    loadFlashcards,
    handleEditToggle,
    handleEditChange,
    handleSaveEdit,
    handleDelete,
    handleCreateFlashcard,
    handleSortChange,
    setIsFormVisible,
  };
}
