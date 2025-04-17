import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center p-4" role="alert">
      <p className="text-lg mb-4">{error}</p>
      <div className="space-x-4">
        <Button onClick={onRetry}>Try Again</Button>
        <Button asChild variant="outline">
          <a href="/flashcards">Back to Flashcards</a>
        </Button>
      </div>
    </div>
  );
}
