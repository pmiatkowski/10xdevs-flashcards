import type { Database } from "./db/database.types";

/*
  DTOs and Command Models for the Fiszki AI application.
  Each type below is derived from the corresponding Database entity types and
  adapted to meet the requirements defined in the API plan.
*/

/**
 * FlashcardDTO represents a flashcard record.
 * Based on the "flashcards" table row definition.
 */
export type FlashcardDTO = Database["public"]["Tables"]["flashcards"]["Row"];

/**
 * CreateManualFlashcardsCommand is used to create one or more flashcards manually.
 * Each flashcard input is based on the "flashcards" insert type but only requires
 * the front_text and back_text fields as the source will be set to 'manual' on creation.
 */
export interface CreateManualFlashcardsCommand {
  flashcards: Pick<Database["public"]["Tables"]["flashcards"]["Insert"], "front_text" | "back_text">[];
}

/**
 * UpdateFlashcardCommand is used to update an existing flashcard.
 * It allows updating the front_text and back_text fields.
 */
export interface UpdateFlashcardCommand {
  front_text: string;
  back_text: string;
}

/**
 * AICandidateDTO represents an AI-generated flashcard candidate.
 * It is derived from the "ai_candidates" table row definition.
 */
export type AICandidateDTO = Database["public"]["Tables"]["ai_candidates"]["Row"];

/**
 * UpdateAICandidateCommand is used to update an AI Candidate.
 * It allows updating the front_text and back_text fields.
 */
export interface UpdateAICandidateCommand {
  front_text: string;
  back_text: string;
}

/**
 * GenerateFlashcardCandidatesCommand is used to trigger the AI generation process.
 * It accepts a sourceText from which flashcard candidates will be generated.
 */
export interface GenerateFlashcardCandidatesCommand {
  sourceText: string;
}

/**
 * GenerationStatisticsDTO represents the statistics for flashcard generation.
 * This includes total counts for generated and accepted events.
 */
export interface GenerationStatisticsDTO {
  totalGenerated: number;
  totalAccepted: number;
  // Optionally, totalRejected can be added in the future.
}

/**
 * DeleteUserAccountCommand represents a command to delete the authenticated user's account.
 * No payload is required for this operation.
 */
export type DeleteUserAccountCommand = Record<string, never>;
