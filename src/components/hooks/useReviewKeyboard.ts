import { useEffect } from "react";
import { useCallback } from "react";

interface UseReviewKeyboardProps {
  onShowAnswer: () => void;
  onMarkAnswer?: (rating: "easy" | "medium" | "hard") => void;
  isAnswerShown: boolean;
}

export const useReviewKeyboard = ({ onShowAnswer, onMarkAnswer, isAnswerShown }: UseReviewKeyboardProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore keyboard events when focused on input elements
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (!isAnswerShown) {
            onShowAnswer();
          }
          break;
        case "1":
          if (isAnswerShown && onMarkAnswer) {
            onMarkAnswer("easy");
          }
          break;
        case "2":
          if (isAnswerShown && onMarkAnswer) {
            onMarkAnswer("medium");
          }
          break;
        case "3":
          if (isAnswerShown && onMarkAnswer) {
            onMarkAnswer("hard");
          }
          break;
      }
    },
    [onShowAnswer, onMarkAnswer, isAnswerShown]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return the handler function for testing purposes
  return {
    handleKeyDown,
  };
};
