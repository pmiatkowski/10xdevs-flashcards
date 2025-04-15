import { apiRequest } from "@/lib/utils/apiUtils";
import type { FlashcardDTO } from "@/types";

interface GetFlashcardsParams {
  limit?: number;
  offset?: number;
  sortBy?: "created_at" | "updated_at";
  order?: "asc" | "desc";
}

interface GetFlashcardsResponse {
  data: FlashcardDTO[];
  total: number;
}

export const flashcardsService = {
  getFlashcards: async (params: GetFlashcardsParams = {}) => {
    const queryParams = new URLSearchParams({
      limit: String(params.limit || 20),
      offset: String(params.offset || 0),
      sortBy: params.sortBy || "created_at",
      order: params.order || "desc",
    });

    return apiRequest<GetFlashcardsResponse>(`/api/flashcards?${queryParams}`);
  },

  createFlashcard: async (flashcard: { front_text: string; back_text: string }) => {
    return apiRequest<FlashcardDTO>("/api/flashcards", {
      method: "POST",
      body: {
        flashcards: [flashcard],
      },
    });
  },

  updateFlashcard: async (id: string, flashcard: { front_text: string; back_text: string }) => {
    return apiRequest<FlashcardDTO>(`/api/flashcards/${id}`, {
      method: "PUT",
      body: flashcard,
    });
  },

  deleteFlashcard: async (id: string) => {
    return apiRequest(`/api/flashcards/${id}`, {
      method: "DELETE",
    });
  },
};
