import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Schema for a single flashcard with front and back text
 */
export const FlashcardSchema = z.object({
  front: z.string().max(200).describe("Front text of the flashcard, containing a question or prompt"),
  back: z.string().max(500).describe("Back text of the flashcard, containing the answer or explanation"),
});

/**
 * Schema for an array of flashcards with length constraints
 */
export const FlashcardArraySchema = z
  .array(FlashcardSchema)
  .min(1)
  .max(5)
  .describe("Array of flashcards generated from the source text");

/**
 * Gets the JSON schema for flashcard validation in OpenRouter API
 * @returns JSON schema object for OpenRouter API
 */
export function getJsonSchemaForFlashcards(): object {
  return zodToJsonSchema(FlashcardArraySchema);
}
