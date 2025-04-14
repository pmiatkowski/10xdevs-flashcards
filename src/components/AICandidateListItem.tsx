import React from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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

interface AICandidateListItemProps {
  candidate: AICandidateViewModel;
  isAuthenticated: boolean;
  onAccept: (candidateId: string) => void;
  onReject: (candidateId: string) => void;
  onEditToggle: (candidateId: string, isEditing: boolean) => void;
  onEditChange: (candidateId: string, field: "front" | "back", value: string) => void;
  onSaveEdit: (candidateId: string) => void;
}

export const AICandidateListItem: React.FC<AICandidateListItemProps> = ({
  candidate,
  isAuthenticated,
  onAccept,
  onReject,
  onEditToggle,
  onEditChange,
  onSaveEdit,
}) => {
  // Display mode (non-editing)
  if (!candidate.isEditing) {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700"
        role="listitem"
      >
        <div className="flex items-center mb-3">
          <span
            className="text-sm text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full px-2.5 py-0.5 mr-2"
            aria-label="AI generated"
          >
            @
          </span>
          <h3 className="text-lg text-xs text-neutral-600 flex-1">AI Generated</h3>
        </div>

        <div className="mb-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Front:</p>
            <p className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
              {candidate.front_text}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Back:</p>
            <p className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
              {candidate.back_text}
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditToggle(candidate.id, true)}
              disabled={candidate.isSaving}
              aria-label="Edit flashcard"
            >
              Edit
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => onAccept(candidate.id)}
              disabled={candidate.isSaving}
              aria-label="Accept flashcard"
            >
              {candidate.isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Accepting...
                </>
              ) : (
                "Accept"
              )}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onReject(candidate.id)}
              disabled={candidate.isSaving}
              aria-label="Reject flashcard"
            >
              {candidate.isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Edit mode (only shown for authenticated users)
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-blue-300 dark:border-blue-700"
      role="listitem"
      aria-label="Flashcard in edit mode"
    >
      <div className="flex items-center mb-3">
        <span
          className="text-sm text-xs text-neutral-600 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full px-2.5 py-0.5 mr-2"
          aria-label="AI generated"
        >
          @
        </span>
        <h3 className="text-lg font-medium flex-1">Edit Flashcard</h3>
      </div>

      <div className="mb-4 space-y-4">
        <div>
          <label
            htmlFor={`front-${candidate.id}`}
            className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Front:
          </label>
          <div className="relative">
            <Textarea
              id={`front-${candidate.id}`}
              value={candidate.editedFront}
              onChange={(e) => onEditChange(candidate.id, "front", e.target.value)}
              disabled={candidate.isSaving}
              className="resize-none min-h-20 w-full"
              aria-describedby={`front-count-${candidate.id} ${candidate.validationErrors?.front ? `front-error-${candidate.id}` : ""}`}
            />
            <div
              id={`front-count-${candidate.id}`}
              className={`mt-1 text-sm text-right ${candidate.editedFront.length > 200 ? "text-red-500" : "text-gray-500"}`}
            >
              {candidate.editedFront.length} / 200 characters
            </div>
          </div>
          {candidate.validationErrors?.front && (
            <p id={`front-error-${candidate.id}`} className="mt-1 text-sm text-red-500" aria-live="polite">
              {candidate.validationErrors.front}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`back-${candidate.id}`}
            className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Back:
          </label>
          <div className="relative">
            <Textarea
              id={`back-${candidate.id}`}
              value={candidate.editedBack}
              onChange={(e) => onEditChange(candidate.id, "back", e.target.value)}
              disabled={candidate.isSaving}
              className="resize-none min-h-20 w-full"
              aria-describedby={`back-count-${candidate.id} ${candidate.validationErrors?.back ? `back-error-${candidate.id}` : ""}`}
            />
            <div
              id={`back-count-${candidate.id}`}
              className={`mt-1 text-sm text-right ${candidate.editedBack.length > 500 ? "text-red-500" : "text-gray-500"}`}
            >
              {candidate.editedBack.length} / 500 characters
            </div>
          </div>
          {candidate.validationErrors?.back && (
            <p id={`back-error-${candidate.id}`} className="mt-1 text-sm text-red-500" aria-live="polite">
              {candidate.validationErrors.back}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onSaveEdit(candidate.id)}
          disabled={candidate.isSaving || candidate.editedFront.length > 200 || candidate.editedBack.length > 500}
          aria-label="Save edits"
        >
          {candidate.isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditToggle(candidate.id, false)}
          disabled={candidate.isSaving}
          aria-label="Cancel edits"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
