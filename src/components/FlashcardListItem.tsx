import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardDTO } from "@/types";

interface FlashcardViewModel extends FlashcardDTO {
  isEditing: boolean;
  editedFront: string;
  editedBack: string;
  validationErrors?: { front?: string; back?: string };
  isSaving?: boolean;
}

interface FlashcardListItemProps {
  flashcard: FlashcardViewModel;
  onEditToggle: (flashcardId: string, isEditing: boolean) => void;
  onEditChange: (flashcardId: string, field: "front" | "back", value: string) => void;
  onSaveEdit: (flashcardId: string) => void;
  onDelete: (flashcardId: string) => void;
}

export const FlashcardListItem: React.FC<FlashcardListItemProps> = ({
  flashcard,
  onEditToggle,
  onEditChange,
  onSaveEdit,
  onDelete,
}) => {
  // Display mode (non-editing)
  if (!flashcard.isEditing) {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700"
        role="listitem"
      >
        <div className="mb-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Front:</p>
            <p className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
              {flashcard.front_text}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Back:</p>
            <p className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
              {flashcard.back_text}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditToggle(flashcard.id, true)}
            disabled={flashcard.isSaving}
            aria-label="Edit flashcard"
          >
            Edit
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(flashcard.id)}
            disabled={flashcard.isSaving}
            aria-label="Delete flashcard"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-blue-300 dark:border-blue-700"
      role="listitem"
      aria-label="Flashcard in edit mode"
    >
      <div className="mb-4 space-y-4">
        <div>
          <label
            htmlFor={`front-${flashcard.id}`}
            className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Front:
          </label>
          <div className="relative">
            <Textarea
              id={`front-${flashcard.id}`}
              value={flashcard.editedFront}
              onChange={(e) => onEditChange(flashcard.id, "front", e.target.value)}
              disabled={flashcard.isSaving}
              className="resize-none min-h-20 w-full"
              aria-describedby={`front-count-${flashcard.id} ${
                flashcard.validationErrors?.front ? `front-error-${flashcard.id}` : ""
              }`}
            />
            <div
              id={`front-count-${flashcard.id}`}
              className={`mt-1 text-sm text-right ${
                flashcard.editedFront.length > 200 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {flashcard.editedFront.length} / 200 characters
            </div>
          </div>
          {flashcard.validationErrors?.front && (
            <p id={`front-error-${flashcard.id}`} className="mt-1 text-sm text-red-500" aria-live="polite">
              {flashcard.validationErrors.front}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`back-${flashcard.id}`}
            className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Back:
          </label>
          <div className="relative">
            <Textarea
              id={`back-${flashcard.id}`}
              value={flashcard.editedBack}
              onChange={(e) => onEditChange(flashcard.id, "back", e.target.value)}
              disabled={flashcard.isSaving}
              className="resize-none min-h-20 w-full"
              aria-describedby={`back-count-${flashcard.id} ${
                flashcard.validationErrors?.back ? `back-error-${flashcard.id}` : ""
              }`}
            />
            <div
              id={`back-count-${flashcard.id}`}
              className={`mt-1 text-sm text-right ${
                flashcard.editedBack.length > 500 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {flashcard.editedBack.length} / 500 characters
            </div>
          </div>
          {flashcard.validationErrors?.back && (
            <p id={`back-error-${flashcard.id}`} className="mt-1 text-sm text-red-500" aria-live="polite">
              {flashcard.validationErrors.back}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onSaveEdit(flashcard.id)}
          disabled={flashcard.isSaving || flashcard.editedFront.length > 200 || flashcard.editedBack.length > 500}
          aria-label="Save edits"
        >
          {flashcard.isSaving ? (
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
          onClick={() => onEditToggle(flashcard.id, false)}
          disabled={flashcard.isSaving}
          aria-label="Cancel edits"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
