import { useId } from "react";
import type { FlashcardDTO } from "../types";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  card: FlashcardDTO | null;
  isBackVisible: boolean;
  className?: string;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

export default function ReviewCard({ card, isBackVisible, className, onKeyPress }: ReviewCardProps) {
  const cardId = useId();
  const frontId = `${cardId}-front`;
  const backId = `${cardId}-back`;

  if (!card) {
    return null;
  }

  return (
    <div
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm transition-all", className)}
      role="region"
      aria-labelledby={frontId}
      onKeyDown={onKeyPress}
      tabIndex={0}
    >
      <div className="p-6">
        <div className="space-y-4">
          <div id={frontId} className="prose dark:prose-invert max-w-none">
            {card.front_text}
          </div>

          {isBackVisible && (
            <>
              <div className="h-px bg-border my-6" role="separator" aria-orientation="horizontal" />
              <div
                id={backId}
                className="prose dark:prose-invert max-w-none"
                role="region"
                aria-label="Answer"
                aria-live="polite"
                aria-atomic="true"
              >
                {card.back_text}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
