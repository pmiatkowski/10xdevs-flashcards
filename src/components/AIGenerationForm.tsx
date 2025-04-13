import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface AIGenerationFormProps {
  onSubmit: (sourceText: string) => void;
  isLoading: boolean;
}

export const AIGenerationForm: React.FC<AIGenerationFormProps> = ({ onSubmit, isLoading }) => {
  const [sourceText, setSourceText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple client-side validation
    if (!sourceText.trim()) {
      setError("Please enter some text to generate flashcards.");
      return;
    }

    if (sourceText.trim().length < 100) {
      setError("Please enter at least 100 characters for better flashcard generation.");
      return;
    }

    setError(null);
    onSubmit(sourceText);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Generate Flashcards with AI</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sourceText" className="block text-sm font-medium mb-1">
            Paste your text here
          </label>
          <Textarea
            id="sourceText"
            placeholder="Paste your learning material here (minimum 100 characters)..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-32 w-full max-h-96"
            disabled={isLoading}
            aria-describedby="textLengthCounter"
          />
          <div className="mt-1 text-sm text-right" id="textLengthCounter">
            <span className={sourceText.length < 100 ? "text-red-500" : "text-gray-500"}>
              {sourceText.length} / 100+ characters
            </span>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto" aria-busy={isLoading}>
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            "Generate Flashcards"
          )}
        </Button>
      </form>
    </div>
  );
};
