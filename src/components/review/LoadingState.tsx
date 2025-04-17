import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
}

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div
      className={cn("flex justify-center items-center h-64", className)}
      role="status"
      aria-label="Loading flashcards"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true" />
      <span className="sr-only">Loading flashcards</span>
    </div>
  );
}
