import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { AIGenerationForm } from "./AIGenerationForm";
import { AICandidateList } from "./AICandidateList";
import { CallToActionLogin } from "./CallToActionLogin";
import { apiRequest, formatApiError } from "../lib/utils/apiUtils";
import { loadGuestState, saveGuestState, clearGuestState } from "../lib/utils/sessionStorage";
import type {
  AICandidateDTO,
  GenerateFlashcardCandidatesCommand,
  UpdateAICandidateCommand,
  FlashcardDTO,
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
  isGuest?: boolean; // Flag to identify candidates created as a guest
}

interface DashboardViewProps {
  isAuthenticated: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ isAuthenticated }) => {
  // State for AI candidates
  const [candidates, setCandidates] = useState<AICandidateViewModel[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Generation state
  const [isLoadingGeneration, setIsLoadingGeneration] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Bulk action state
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);

  // State for saving guest candidates after login
  const [isSavingGuestCandidates, setIsSavingGuestCandidates] = useState<boolean>(false);

  // State for viewing saved flashcards
  const [showSavedFlashcards, setShowSavedFlashcards] = useState<boolean>(false);

  // Load guest state on mount and handle login transition
  useEffect(() => {
    const guestState = loadGuestState();

    if (!isAuthenticated) {
      // For guests: load any previously generated candidates from sessionStorage
      if (guestState.candidates && guestState.candidates.length > 0) {
        const viewModels = guestState.candidates.map((candidate) => ({
          ...candidate,
          isEditing: false,
          editedFront: candidate.front_text,
          editedBack: candidate.back_text,
          isGuest: true,
        }));
        setCandidates(viewModels);
        setShowLoginPrompt(true);
      }
    } else {
      // For authenticated users, we'll show their saved flashcards by default
      setShowSavedFlashcards(true);

      // If there are also guest candidates, save them
      if (guestState.candidates && guestState.candidates.length > 0) {
        setIsSavingGuestCandidates(true);

        // First, let's save these temporary guest candidates to the database
        const saveGuestCandidatesToDatabase = async () => {
          try {
            // Generate candidates in the database using the original source text
            const data = await apiRequest<AICandidateDTO[]>("/api/ai/generate", {
              method: "POST",
              body: { sourceText: guestState.sourceText } as GenerateFlashcardCandidatesCommand,
            });

            // Transform to viewmodel and mark them as saved
            const viewModels = data.map((candidate: AICandidateDTO) => ({
              ...candidate,
              isEditing: false,
              editedFront: candidate.front_text,
              editedBack: candidate.back_text,
            }));

            setCandidates(viewModels);
            clearGuestState();
            toast.success("Your flashcard candidates have been saved to your account!");
          } catch (error) {
            console.error("Error saving guest candidates:", error);

            // If we can't save to database, still show the guest candidates from session storage
            if (guestState.candidates) {
              const viewModels = guestState.candidates.map((candidate) => ({
                ...candidate,
                isEditing: false,
                editedFront: candidate.front_text,
                editedBack: candidate.back_text,
                isGuest: true,
              }));
              setCandidates(viewModels);
            }

            toast.error("Failed to save your flashcards. Please try generating them again.");
          } finally {
            setIsSavingGuestCandidates(false);
          }
        };

        saveGuestCandidatesToDatabase();
      }
    }
  }, [isAuthenticated]);

  // Handler for generating flashcards
  const handleGenerate = useCallback(
    async (sourceText: string) => {
      setIsLoadingGeneration(true);
      setGenerationError(null);

      try {
        const data = await apiRequest<AICandidateDTO[]>("/api/ai/generate", {
          method: "POST",
          body: { sourceText } as GenerateFlashcardCandidatesCommand,
        });

        // Transform AICandidateDTO[] to AICandidateViewModel[]
        const viewModels = data.map((candidate: AICandidateDTO) => ({
          ...candidate,
          isEditing: false,
          editedFront: candidate.front_text,
          editedBack: candidate.back_text,
          isGuest: !isAuthenticated,
        }));

        setCandidates(viewModels);

        // For guests: save state and show login prompt
        if (!isAuthenticated) {
          saveGuestState({ sourceText, candidates: data });
          setShowLoginPrompt(true);
        }

        // Show toast notification of success
        toast.success(`Generated ${viewModels.length} flashcard candidates`);
      } catch (error) {
        console.error("Generation error:", error);
        const errorMessage = formatApiError(error);
        setGenerationError(errorMessage);
        // Show toast notification of error
        toast.error(errorMessage);
      } finally {
        setIsLoadingGeneration(false);
      }
    },
    [isAuthenticated]
  );

  // Handler for accepting a candidate
  const handleAccept = useCallback(
    async (candidateId: string) => {
      if (!isAuthenticated) return;

      // Find the candidate in state
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      // If this is a guest candidate that hasn't been saved to DB yet, we need special handling
      if (candidate.isGuest) {
        // Create a flashcard directly without going through the AI candidate workflow
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: true } : c)));

        try {
          await apiRequest<FlashcardDTO>("/api/flashcards", {
            method: "POST",
            body: {
              flashcards: [
                {
                  front_text: candidate.front_text,
                  back_text: candidate.back_text,
                },
              ],
            },
          });

          // On success, remove the candidate from the list
          setCandidates((prev) => prev.filter((c) => c.id !== candidateId));

          // Refresh saved flashcards if visible
          if (showSavedFlashcards) {
            // A simple approach to trigger a refresh of the FlashcardList
            setShowSavedFlashcards(false);
            setTimeout(() => setShowSavedFlashcards(true), 100);
          }

          // Show success toast
          toast.success("Flashcard saved successfully");
        } catch (error) {
          console.error("Accept error:", error);

          // Reset the saving state
          setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: false } : c)));

          // Show error toast
          toast.error(formatApiError(error));
        }
        return;
      }

      // Regular database candidate - use the API endpoint
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: true } : c)));

      try {
        await apiRequest<FlashcardDTO>(`/api/ai-candidates/${candidateId}/accept`, {
          method: "POST",
        });

        // On success, remove the candidate from the list
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));

        // Refresh saved flashcards if visible
        if (showSavedFlashcards) {
          // A simple approach to trigger a refresh of the FlashcardList
          setShowSavedFlashcards(false);
          setTimeout(() => setShowSavedFlashcards(true), 100);
        }

        // Show success toast
        toast.success("Flashcard accepted successfully");
      } catch (error) {
        console.error("Accept error:", error);

        // Reset the saving state
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: false } : c)));

        // Show error toast
        toast.error(formatApiError(error));
      }
    },
    [candidates, isAuthenticated, showSavedFlashcards]
  );

  // Handler for rejecting a candidate
  const handleReject = useCallback(
    async (candidateId: string) => {
      if (!isAuthenticated) return;

      // Find the candidate in state
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      // If this is a guest candidate, we don't need to call the API
      if (candidate.isGuest) {
        // Just remove from state
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
        toast.success("Flashcard rejected");
        return;
      }

      // Update candidate state to show loading
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: true } : c)));

      try {
        await apiRequest(`/api/ai-candidates/${candidateId}`, {
          method: "DELETE",
        });

        // On success, remove the candidate from the list
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));

        // Show success toast
        toast.success("Flashcard rejected");
      } catch (error) {
        console.error("Reject error:", error);

        // Reset the saving state
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: false } : c)));

        // Show error toast
        toast.error(formatApiError(error));
      }
    },
    [candidates, isAuthenticated]
  );

  // Handler for toggling edit mode
  const handleEditToggle = useCallback(
    (candidateId: string, isEditing: boolean) => {
      if (!isAuthenticated) return;

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
    },
    [isAuthenticated]
  );

  // Handler for handling edit changes
  const handleEditChange = useCallback(
    (candidateId: string, field: "front" | "back", value: string) => {
      if (!isAuthenticated) return;

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
    },
    [isAuthenticated]
  );

  // Handler for saving edits
  const handleSaveEdit = useCallback(
    async (candidateId: string) => {
      if (!isAuthenticated) return;

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

      // If this is a guest candidate, update it in state only
      if (candidate.isGuest) {
        try {
          setCandidates((prev) =>
            prev.map((c) =>
              c.id === candidateId
                ? {
                    ...c,
                    front_text: candidate.editedFront,
                    back_text: candidate.editedBack,
                    isEditing: false,
                    isSaving: false,
                    validationErrors: undefined,
                  }
                : c
            )
          );

          // Show success toast
          toast.success("Flashcard updated");
        } catch (error) {
          console.error("Update error:", error);
          setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, isSaving: false } : c)));
          toast.error("Failed to update flashcard");
        }
        return;
      }

      try {
        const updateData: UpdateAICandidateCommand = {
          front_text: candidate.editedFront,
          back_text: candidate.editedBack,
        };

        const updatedCandidate = await apiRequest<AICandidateDTO>(`/api/ai-candidates/${candidateId}`, {
          method: "PUT",
          body: updateData,
        });

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
        toast.error(formatApiError(error));
      }
    },
    [candidates, isAuthenticated]
  );

  // Handler for accepting all candidates
  const handleAcceptAll = useCallback(async () => {
    if (!isAuthenticated || candidates.length === 0 || candidates.some((c) => c.isEditing)) return;

    setIsBulkLoading(true);

    // Check if we have any guest candidates
    const hasGuestCandidates = candidates.some((c) => c.isGuest);

    if (hasGuestCandidates) {
      // For guest candidates, we need to create flashcards directly
      const acceptPromises = candidates.map((candidate) => {
        if (candidate.isGuest) {
          // Create flashcard directly for guest candidates
          return apiRequest<FlashcardDTO>("/api/flashcards", {
            method: "POST",
            body: {
              flashcards: [
                {
                  front_text: candidate.front_text,
                  back_text: candidate.back_text,
                },
              ],
            },
          })
            .then(() => ({ success: true, id: candidate.id }))
            .catch((error) => ({ success: false, id: candidate.id, error }));
        } else {
          // Use regular endpoint for database candidates
          return apiRequest<FlashcardDTO>(`/api/ai-candidates/${candidate.id}/accept`, {
            method: "POST",
          })
            .then(() => ({ success: true, id: candidate.id }))
            .catch((error) => ({ success: false, id: candidate.id, error }));
        }
      });

      try {
        const results = await Promise.all(acceptPromises);

        // Count successful and failed operations
        const successful = results.filter((r) => r.success).map((r) => r.id);
        const failed = results.filter((r) => !r.success).length;

        // Remove successful candidates from state
        if (successful.length > 0) {
          setCandidates((prev) => prev.filter((c) => !successful.includes(c.id)));
        }

        // Refresh saved flashcards if visible
        if (showSavedFlashcards && successful.length > 0) {
          // A simple approach to trigger a refresh of the FlashcardList
          setShowSavedFlashcards(false);
          setTimeout(() => setShowSavedFlashcards(true), 100);
        }

        // Show appropriate toast
        if (failed === 0) {
          toast.success(`Successfully saved all ${successful.length} flashcards`);
        } else if (successful.length > 0) {
          toast.info(`Saved ${successful.length} flashcards, but ${failed} failed`);
        } else {
          toast.error("Failed to save flashcards");
        }
      } catch (error) {
        console.error("Accept all error:", error);
        toast.error(formatApiError(error));
      } finally {
        setIsBulkLoading(false);
      }
      return;
    }

    // Regular flow for database candidates
    const acceptPromises = candidates.map((candidate) =>
      apiRequest<FlashcardDTO>(`/api/ai-candidates/${candidate.id}/accept`, {
        method: "POST",
      })
        .then(() => ({ success: true, id: candidate.id }))
        .catch((error) => ({ success: false, id: candidate.id, error }))
    );

    try {
      const results = await Promise.all(acceptPromises);

      // Count successful and failed operations
      const successful = results.filter((r) => r.success).map((r) => r.id);

      const failed = results.filter((r) => !r.success).length;

      // Remove successful candidates from state
      if (successful.length > 0) {
        setCandidates((prev) => prev.filter((c) => !successful.includes(c.id)));
      }

      // Refresh saved flashcards if visible
      if (showSavedFlashcards && successful.length > 0) {
        // A simple approach to trigger a refresh of the FlashcardList
        setShowSavedFlashcards(false);
        setTimeout(() => setShowSavedFlashcards(true), 100);
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
      toast.error(formatApiError(error));
    } finally {
      setIsBulkLoading(false);
    }
  }, [candidates, isAuthenticated, showSavedFlashcards]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">AI Flashcard Generator</h1>

        <AIGenerationForm onSubmit={handleGenerate} isLoading={isLoadingGeneration} />

        {generationError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-200 mt-4">
            <p className="font-medium">Generation Error</p>
            <p className="text-sm">{generationError}</p>
          </div>
        )}

        {!isAuthenticated && showLoginPrompt && candidates.length > 0 && (
          <div className="mt-8">
            <CallToActionLogin />
          </div>
        )}

        {isSavingGuestCandidates && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-700 dark:text-blue-200 mt-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p>Loading...</p>
              </div>
            </div>
            {/* Show the guest candidates from sessionStorage while saving */}
            {(() => {
              const guestState = loadGuestState();
              if (guestState.candidates && guestState.candidates.length > 0) {
                const temporaryViewModels = guestState.candidates.map((candidate) => ({
                  ...candidate,
                  isEditing: false,
                  editedFront: candidate.front_text,
                  editedBack: candidate.back_text,
                  isGuest: true,
                }));
                return (
                  <div className="mt-8 opacity-50">
                    <h2 className="text-2xl font-semibold mb-4">Flashcard Candidates</h2>
                    <AICandidateList
                      candidates={temporaryViewModels}
                      onAccept={async () => undefined}
                      onReject={async () => undefined}
                      onEditToggle={() => undefined}
                      onEditChange={() => undefined}
                      onSaveEdit={async () => undefined}
                      onAcceptAll={async () => undefined}
                      isBulkLoading={false}
                      isAuthenticated={false}
                    />
                  </div>
                );
              }
              return null;
            })()}
          </>
        )}

        {!isSavingGuestCandidates && !isLoadingGeneration && !generationError && candidates.length === 0 && (
          <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-6">
            <p className="text-gray-500 dark:text-gray-400">
              No flashcard candidates generated yet. Paste your text above and click &quot;Generate Flashcards&quot;.
            </p>
          </div>
        )}

        {candidates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Flashcard Candidates</h2>
            <AICandidateList
              candidates={candidates}
              onAccept={handleAccept}
              onReject={handleReject}
              onEditToggle={handleEditToggle}
              onEditChange={handleEditChange}
              onSaveEdit={handleSaveEdit}
              onAcceptAll={handleAcceptAll}
              isBulkLoading={isBulkLoading}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}
      </div>
    </div>
  );
};
