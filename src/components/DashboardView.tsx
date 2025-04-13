import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { AIGenerationForm } from "./AIGenerationForm";
import { AICandidateList } from "./AICandidateList";
import type {
  AICandidateDTO,
  GenerateFlashcardCandidatesCommand,
  ApiErrorResponseDto,
  UpdateAICandidateCommand,
} from "../types";

/**
 * AICandidateViewModel extends AICandidateDTO with UI-specific state.
 */
interface AICandidateViewModel extends AICandidateDTO {
  isEditing: boolean;
  editedFront: string;
  editedBack: string;
  validationErrors?: { front?: string; back?: string };
  isSaving?: boolean;
}

export const DashboardView: React.FC = () => {
  // State for AI candidates
  const [candidates, setCandidates] = useState<AICandidateViewModel[]>([]);

  // Generation state
  const [isLoadingGeneration, setIsLoadingGeneration] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<ApiErrorResponseDto | string | null>(null);

  // Bulk action state
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);

  // Handler for generating flashcards
  const handleGenerate = useCallback(async (sourceText: string) => {
    setIsLoadingGeneration(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceText } as GenerateFlashcardCandidatesCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const { data } = await response.json();

      // Transform AICandidateDTO[] to AICandidateViewModel[]
      const viewModels = data.map((candidate: AICandidateDTO) => ({
        ...candidate,
        isEditing: false,
        editedFront: candidate.front_text,
        editedBack: candidate.back_text,
      }));

      setCandidates(viewModels);

      // Show toast notification of success
      toast.success(`Generated ${viewModels.length} flashcard candidates`);
    } catch (error) {
      console.error("Generation error:", error);
      setGenerationError(
        typeof error === "object" && error !== null ? (error as ApiErrorResponseDto) : "Failed to generate flashcards"
      );
      // Show toast notification of error
      toast.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as ApiErrorResponseDto).message
          : "Failed to generate flashcards"
      );
    } finally {
      setIsLoadingGeneration(false);
    }
  }, []);

  // Handler for accepting a candidate
  const handleAccept = useCallback(
    async (candidateId: string) => {
      // Find the candidate in state
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      // Update candidate state to show loading
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: true } : c)));

      try {
        const response = await fetch(`/api/ai-candidates/${candidateId}/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(candidate),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }

        // On success, remove the candidate from the list
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));

        // Show success toast
        toast.success("Flashcard accepted successfully");
      } catch (error) {
        console.error("Accept error:", error);

        // Reset the saving state
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: false } : c)));

        // Show error toast
        toast.error(
          typeof error === "object" && error !== null && "message" in error
            ? (error as ApiErrorResponseDto).message
            : "Failed to accept flashcard"
        );
      }
    },
    [candidates]
  );

  // Handler for rejecting a candidate
  const handleReject = useCallback(
    async (candidateId: string) => {
      // Find the candidate in state
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      // Update candidate state to show loading
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: true } : c)));

      try {
        const response = await fetch(`/api/ai-candidates/${candidateId}`, {
          method: "DELETE",
        });

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw errorData;
        }

        // On success, remove the candidate from the list
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));

        // Show success toast
        toast.success("Flashcard rejected");
      } catch (error) {
        console.error("Reject error:", error);

        // Reset the saving state
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: false } : c)));

        // Show error toast
        toast.error(
          typeof error === "object" && error !== null && "message" in error
            ? (error as ApiErrorResponseDto).message
            : "Failed to reject flashcard"
        );
      }
    },
    [candidates]
  );

  // Handler for toggling edit mode
  const handleEditToggle = useCallback((candidateId: string, isEditing: boolean) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          // If entering edit mode, copy the current values to edited values
          if (isEditing) {
            return {
              ...c,
              isEditing,
              editedFront: c.front_text,
              editedBack: c.back_text,
              validationErrors: undefined,
            };
          }
          // If exiting edit mode, just toggle the flag (discard changes)
          return { ...c, isEditing };
        }
        return c;
      })
    );
  }, []);

  // Handler for handling edit changes
  const handleEditChange = useCallback((candidateId: string, field: "front" | "back", value: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const updatedCandidate = {
            ...c,
            [field === "front" ? "editedFront" : "editedBack"]: value,
          };

          // Validate on change
          const validationErrors = {
            ...c.validationErrors,
          };

          if (field === "front" && value.length > 200) {
            validationErrors.front = "Front text must be 200 characters or less";
          } else if (field === "front") {
            delete validationErrors.front;
          }

          if (field === "back" && value.length > 500) {
            validationErrors.back = "Back text must be 500 characters or less";
          } else if (field === "back") {
            delete validationErrors.back;
          }

          return {
            ...updatedCandidate,
            validationErrors: Object.keys(validationErrors).length > 0 ? validationErrors : undefined,
          };
        }
        return c;
      })
    );
  }, []);

  // Handler for saving edits
  const handleSaveEdit = useCallback(
    async (candidateId: string) => {
      // Find the candidate
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      // Validate before saving
      const validationErrors: { front?: string; back?: string } = {};

      if (candidate.editedFront.length > 200) {
        validationErrors.front = "Front text must be 200 characters or less";
      }

      if (candidate.editedBack.length > 500) {
        validationErrors.back = "Back text must be 500 characters or less";
      }

      if (Object.keys(validationErrors).length > 0) {
        // Update candidate with validation errors
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, validationErrors } : c)));
        return;
      }

      // Set saving state
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, source: "ai-edited", isSaving: true } : c))
      );

      try {
        const updateData: UpdateAICandidateCommand = {
          front_text: candidate.editedFront,
          back_text: candidate.editedBack,
        };

        const response = await fetch(`/api/ai-candidates/${candidateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }

        // Get updated candidate from response
        const updatedCandidate = await response.json();

        // Update candidate in state
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId
              ? {
                  ...updatedCandidate,
                  isEditing: false,
                  isSaving: false,
                  editedFront: updatedCandidate.front_text,
                  editedBack: updatedCandidate.back_text,
                  validationErrors: undefined,
                }
              : c
          )
        );

        // Show success toast
        toast.success("Flashcard updated successfully");
      } catch (error) {
        console.error("Update error:", error);

        // Reset saving state
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: false } : c)));

        // Show error toast
        toast.error(
          typeof error === "object" && error !== null && "message" in error
            ? (error as ApiErrorResponseDto).message
            : "Failed to update flashcard"
        );
      }
    },
    [candidates]
  );

  // Handler for accepting all candidates
  const handleAcceptAll = useCallback(async () => {
    if (candidates.length === 0 || candidates.some((c) => c.isEditing)) return;

    setIsBulkLoading(true);

    const acceptPromises = candidates.map((candidate) =>
      fetch(`/api/ai-candidates/${candidate.id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            return { success: false, id: candidate.id, error: errorData };
          }
          return { success: true, id: candidate.id };
        })
        .catch((error) => ({ success: false, id: candidate.id, error }))
    );

    try {
      const results = await Promise.allSettled(acceptPromises);

      // Count successful and failed operations
      const successful = results
        .filter((r) => r.status === "fulfilled" && "value" in r && r.value.success)
        .map((r) => (r.status === "fulfilled" && "value" in r ? r.value.id : null));

      const failed = results.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && "value" in r && !r.value.success)
      ).length;

      // Remove successful candidates from state
      if (successful.length > 0) {
        setCandidates((prev) => prev.filter((c) => !successful.includes(c.id)));
      }

      // Show appropriate toast
      if (failed === 0) {
        toast.success(`Successfully accepted all ${successful.length} flashcards`);
      } else if (successful.length > 0) {
        toast.info(`Accepted ${successful.length} flashcards, but ${failed} failed`);
      } else {
        toast.error(`Failed to accept flashcards`);
      }
    } catch (error) {
      console.error("Accept all error:", error);
      toast.error("Failed to process bulk accept operation");
    } finally {
      setIsBulkLoading(false);
    }
  }, [candidates]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">AI Flashcard Generator</h1>

      <AIGenerationForm onSubmit={handleGenerate} isLoading={isLoadingGeneration} />

      {generationError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-200">
          <p className="font-medium">Generation Error</p>
          <p className="text-sm">
            {typeof generationError === "string"
              ? generationError
              : generationError.message || "An unknown error occurred"}
          </p>
        </div>
      )}

      {candidates.length > 0 && (
        <AICandidateList
          candidates={candidates}
          onAccept={handleAccept}
          onReject={handleReject}
          onEditToggle={handleEditToggle}
          onEditChange={handleEditChange}
          onSaveEdit={handleSaveEdit}
          onAcceptAll={handleAcceptAll}
          isBulkLoading={isBulkLoading}
        />
      )}

      {!isLoadingGeneration && !generationError && candidates.length === 0 && (
        <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No flashcard candidates generated yet. Paste your text above and click &quot;Generate Flashcards&quot;.
          </p>
        </div>
      )}
    </div>
  );
};
