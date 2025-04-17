import { useEffect } from "react";

interface UseReviewKeyboardProps {
  isBackVisible: boolean;
  showAnswer: () => void;
  handleRating: (rating: number) => void;
}

export function useReviewKeyboard({ isBackVisible, showAnswer, handleRating }: UseReviewKeyboardProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          if (!isBackVisible) {
            showAnswer();
          }
          break;
        case "1":
        case "h":
          if (isBackVisible) {
            handleRating(1);
          }
          break;
        case "2":
        case "g":
          if (isBackVisible) {
            handleRating(2);
          }
          break;
        case "3":
        case "e":
          if (isBackVisible) {
            handleRating(3);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isBackVisible, showAnswer, handleRating]);
}
