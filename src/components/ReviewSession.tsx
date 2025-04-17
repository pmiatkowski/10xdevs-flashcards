import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import ReviewCard from "./ReviewCard";
import { useReviewSession } from "./hooks/useReviewSession";
import { useReviewKeyboard } from "./hooks/useReviewKeyboard";
import { LoadingState } from "./review/LoadingState";
import { ErrorState } from "./review/ErrorState";

export default function ReviewSession() {
  const {
    currentCard,
    isLoading,
    error,
    isBackVisible,
    isSessionComplete,
    totalCards,
    currentCardIndex,
    stats,
    shortcuts,
    showAnswer,
    handleRating,
    resetSession,
  } = useReviewSession();

  useReviewKeyboard({
    isBackVisible,
    showAnswer,
    handleRating,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={resetSession} />;
  }

  if (totalCards === 0) {
    return (
      <div className="text-center p-4" role="status">
        <p className="text-lg mb-4">No flashcards to review at the moment.</p>
        <Button asChild variant="outline">
          <a href="/flashcards">Create Flashcards</a>
        </Button>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <div className="text-center p-4" role="status">
        <h2 className="text-2xl font-bold mb-4">Session Complete! 🎉</h2>
        <Button onClick={resetSession} className="mr-4">
          Review Again
        </Button>
        <Button asChild variant="outline">
          <a href="/flashcards">Back to Flashcards</a>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-2xl mx-auto" role="main" aria-label="Flashcard review session">
        <header className="mb-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Card {currentCardIndex + 1} of {totalCards}
            </p>
            {stats && (
              <p className="text-sm text-muted-foreground">
                {stats.isNew ? "New card" : `Reviews: ${stats.totalReviews}`}
              </p>
            )}
          </div>
        </header>

        <ReviewCard card={currentCard} isBackVisible={isBackVisible} />

        <div className="mt-8 space-y-4">
          <div className="flex justify-center gap-4">
            {!isBackVisible ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    onClick={showAnswer}
                    aria-label={`${shortcuts.showAnswer.description} (press ${shortcuts.showAnswer.label})`}
                  >
                    Show Answer
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={5}>
                  <div className="relative z-10">
                    {"Press "}
                    <kbd className="px-2 py-1 bg-muted text-muted-foreground font-mono text-xs rounded border">
                      {shortcuts.showAnswer.label}
                    </kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => handleRating(1)}
                      aria-label={`${shortcuts.rateHard.description} (press ${shortcuts.rateHard.label})`}
                    >
                      Hard
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5}>
                    <div className="relative z-10">
                      {"Press "}
                      <kbd className="px-2 py-1 bg-muted text-muted-foreground font-mono text-xs rounded border">
                        {shortcuts.rateHard.label}
                      </kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => handleRating(2)}
                      aria-label={`${shortcuts.rateGood.description} (press ${shortcuts.rateGood.label})`}
                    >
                      Good
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5}>
                    <div className="relative z-10">
                      {"Press "}
                      <kbd className="px-2 py-1 bg-muted text-muted-foreground font-mono text-xs rounded border">
                        {shortcuts.rateGood.label}
                      </kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      onClick={() => handleRating(3)}
                      aria-label={`${shortcuts.rateEasy.description} (press ${shortcuts.rateEasy.label})`}
                    >
                      Easy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5}>
                    <div className="relative z-10">
                      {"Press "}
                      <kbd className="px-2 py-1 bg-muted text-muted-foreground font-mono text-xs rounded border">
                        {shortcuts.rateEasy.label}
                      </kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {stats && !stats.isNew && !isBackVisible && <p>Last reviewed {stats.daysUntilReview} days ago</p>}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
