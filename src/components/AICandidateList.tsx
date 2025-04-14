import React from "react";
import { Button } from "./ui/button";
import { AICandidateListItem } from "./AICandidateListItem";

interface AICandidateViewModel {
  id: string;
  front_text: string;
  back_text: string;
  isEditing: boolean;
  editedFront: string;
  editedBack: string;
  validationErrors?: { front?: string; back?: string };
  isSaving?: boolean;
}

interface AICandidateListProps {
  candidates: AICandidateViewModel[];
  isAuthenticated: boolean;
  onAccept: (candidateId: string) => void;
  onReject: (candidateId: string) => void;
  onEditToggle: (candidateId: string, isEditing: boolean) => void;
  onEditChange: (candidateId: string, field: "front" | "back", value: string) => void;
  onSaveEdit: (candidateId: string) => void;
  onAcceptAll: () => void;
  isBulkLoading: boolean;
}

export const AICandidateList: React.FC<AICandidateListProps> = ({
  candidates,
  isAuthenticated,
  onAccept,
  onReject,
  onEditToggle,
  onEditChange,
  onSaveEdit,
  onAcceptAll,
  isBulkLoading,
}) => {
  // Check if any candidate is currently in edit mode
  const isAnyEditing = candidates.some((candidate) => candidate.isEditing);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Generated Flashcards ({candidates.length})</h2>
        {isAuthenticated && (
          <Button
            onClick={onAcceptAll}
            disabled={isBulkLoading || isAnyEditing || candidates.length === 0}
            className="whitespace-nowrap"
            aria-busy={isBulkLoading}
            aria-label="Accept all flashcards"
          >
            {isBulkLoading ? (
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
                Processing...
              </>
            ) : (
              "Accept All"
            )}
          </Button>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No flashcard candidates available.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1" role="list" aria-label="Flashcard candidates">
          {candidates.map((candidate) => (
            <AICandidateListItem
              key={candidate.id}
              candidate={candidate}
              isAuthenticated={isAuthenticated}
              onAccept={onAccept}
              onReject={onReject}
              onEditToggle={onEditToggle}
              onEditChange={onEditChange}
              onSaveEdit={onSaveEdit}
            />
          ))}
        </div>
      )}

      {isAnyEditing && (
        <div
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-700 dark:text-amber-200"
          role="alert"
        >
          <p className="text-sm">
            <strong>Note:</strong> &quot;Accept All&quot; is disabled while editing. Please save or cancel your edits
            first.
          </p>
        </div>
      )}
    </div>
  );
};
