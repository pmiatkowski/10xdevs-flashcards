import { useCallback, useEffect, useMemo, useState } from "react";
import type { FlashcardDTO } from "../../types";
import { SRService } from "@/lib/services/srService";
import { SRStorageService } from "@/lib/services/srStorageService";
import { NoCardsAvailableError } from "@/lib/errors/reviewErrors";
import { formatApiError } from "@/lib/utils/apiUtils";

interface ReviewSessionState {
  isLoading: boolean;
  error: string | null;
  allFlashcards: FlashcardDTO[];
  reviewQueue: FlashcardDTO[];
  currentCardIndex: number;
  isBackVisible: boolean;
  isSessionComplete: boolean;
}

export interface ReviewActionShortcut {
  key: string;
  altKey?: string;
  label: string;
  description: string;
}

export const REVIEW_SHORTCUTS: Record<string, ReviewActionShortcut> = {
  showAnswer: {
    key: "Space",
    label: "Space",
    description: "Show answer",
  },
  rateHard: {
    key: "1",
    altKey: "H",
    label: "1 or H",
    description: "Rate as Hard",
  },
  rateGood: {
    key: "2",
    altKey: "G",
    label: "2 or G",
    description: "Rate as Good",
  },
  rateEasy: {
    key: "3",
    altKey: "E",
    label: "3 or E",
    description: "Rate as Easy",
  },
};

const initialState: ReviewSessionState = {
  isLoading: true,
  error: null,
  allFlashcards: [],
  reviewQueue: [],
  currentCardIndex: 0,
  isBackVisible: false,
  isSessionComplete: false,
};

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useReviewSession() {
  const [state, setState] = useState<ReviewSessionState>(initialState);

  const srService = useMemo(() => new SRService(), []);
  const storageService = useMemo(() => new SRStorageService(), []);

  const fetchAndInitializeSession = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch("/api/flashcards");
      if (!response.ok) {
        throw new Error("Failed to load flashcards");
      }
      const data = await response.json();

      const dueFlashcards = data.data.filter((card: FlashcardDTO) => {
        const cardState = storageService.getCardState(card.id);
        return srService.isDue(cardState);
      });

      if (dueFlashcards.length === 0) {
        throw new NoCardsAvailableError();
      }

      // Shuffle the cards before initializing the queue
      const shuffledCards = shuffleArray(dueFlashcards);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        allFlashcards: data.data,
        reviewQueue: shuffledCards,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof NoCardsAvailableError ? error.message : "Failed to load flashcards",
      }));
    }
  }, [srService, storageService]);

  useEffect(() => {
    fetchAndInitializeSession();
  }, [fetchAndInitializeSession]);

  const showAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.isSessionComplete) return prev;
      return { ...prev, isBackVisible: true };
    });
  }, []);

  const handleRating = useCallback(
    (rating: number) => {
      setState((prev) => {
        if (prev.isSessionComplete || !prev.isBackVisible) return prev;

        const currentCard = prev.reviewQueue[prev.currentCardIndex];
        if (!currentCard) return prev;

        try {
          const currentState = storageService.getCardState(currentCard.id);
          const newState = srService.calculateNextReview(rating, {
            ...currentState,
            cardId: currentCard.id,
          });
          storageService.updateCardState(currentCard.id, newState);

          const nextIndex = prev.currentCardIndex + 1;
          const isComplete = nextIndex >= prev.reviewQueue.length;

          return {
            ...prev,
            currentCardIndex: nextIndex,
            isBackVisible: false,
            isSessionComplete: isComplete,
          };
        } catch (error) {
          return {
            ...prev,
            error: formatApiError(error),
          };
        }
      });
    },
    [srService, storageService]
  );

  const resetSession = useCallback(async () => {
    setState(() => ({ ...initialState }));
    try {
      storageService.clearState();
      await fetchAndInitializeSession();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: formatApiError(error),
      }));
    }
  }, [fetchAndInitializeSession, storageService]);

  const currentCard = useMemo(() => {
    return state.reviewQueue[state.currentCardIndex] ?? null;
  }, [state.reviewQueue, state.currentCardIndex]);

  const stats = useMemo(() => {
    if (!currentCard) return null;
    const cardState = storageService.getCardState(currentCard.id);
    return srService.getStats(cardState);
  }, [currentCard, srService, storageService]);

  return {
    currentCard,
    isLoading: state.isLoading,
    error: state.error,
    isBackVisible: state.isBackVisible,
    isSessionComplete: state.isSessionComplete,
    totalCards: state.reviewQueue.length,
    currentCardIndex: state.currentCardIndex,
    stats,
    shortcuts: REVIEW_SHORTCUTS,
    showAnswer,
    handleRating,
    resetSession,
  };
}
