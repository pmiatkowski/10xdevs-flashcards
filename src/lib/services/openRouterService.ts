import { createHash } from "node:crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { AICandidateDTO } from "../../types";
import type { Database } from "../../db/database.types";
import { logger } from "../utils";
import {
  ConfigurationError,
  NetworkError,
  AuthenticationError,
  PaymentRequiredError,
  RateLimitError,
  ApiServiceError,
  InvalidResponseFormatError,
  ResponseValidationError,
  DatabaseError,
  EmptyValidResponseError,
} from "../errors/openRouterErrors";
import { FlashcardArraySchema, getJsonSchemaForFlashcards } from "./openRouterSchemas";

// Types from database and shared types
type AiCandidateInsert = Database["public"]["Tables"]["ai_candidates"]["Insert"];
type GenerationStatsInsert = Database["public"]["Tables"]["generation_stats"]["Insert"];

// Private interfaces for OpenRouter API
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface OpenRouterErrorResponse {
  error?: {
    message?: string;
    code?: number;
  };
}

export class OpenRouterService {
  /**
   * Calculates MD5 hash of the input text
   * @param text Text to hash
   * @returns MD5 hash in hexadecimal format
   */ private _calculateMd5(text: string): string {
    return createHash("md5").update(text).digest("hex");
  }
  /**
   * Calls the OpenRouter API with proper error handling
   * @param messages Array of messages to send to the API
   * @param jsonSchema JSON schema for response validation
   * @param model Model name from configuration
   * @param apiKey API key from configuration
   * @param params Optional additional parameters
   * @returns Parsed response from OpenRouter API
   */
  private async _callOpenRouterAPI(
    messages: { role: string; content: string }[],
    jsonSchema: object,
    model: string,
    apiKey: string,
    params?: object
  ): Promise<unknown[]> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": import.meta.env.OPENROUTER_HTTP_REFERER || "https://github.com/10xdevs",
          "X-Title": import.meta.env.OPENROUTER_APP_TITLE || "Fiszki",
        },
        body: JSON.stringify({
          model,
          messages,
          format: "json",
          ...params,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("OpenRouter API Error:", response.status, errorText);

        let errorMessage = "OpenRouter API request failed.";
        try {
          const errorJson = JSON.parse(errorText) as OpenRouterErrorResponse;
          if (errorJson.error?.message) {
            errorMessage = errorJson.error.message;
          }
        } catch (parseError) {
          logger.error("Failed to parse error response:", parseError);
        }

        switch (response.status) {
          case 401:
          case 403:
            throw new AuthenticationError(errorMessage);
          case 402:
            throw new PaymentRequiredError(errorMessage);
          case 429:
            throw new RateLimitError(errorMessage);
          case 500:
          case 502:
          case 503:
          case 504:
            throw new ApiServiceError(errorMessage, response.status);
          default:
            throw new ApiServiceError(errorMessage, response.status);
        }
      }

      const data = (await response.json()) as OpenRouterResponse;
      if (!data.choices?.[0]?.message?.content) {
        throw new InvalidResponseFormatError("Invalid response structure from OpenRouter API");
      }

      try {
        const parsedContent = JSON.parse(data.choices[0].message.content);
        if (!Array.isArray(parsedContent)) {
          throw new InvalidResponseFormatError("Response content is not an array");
        }
        return parsedContent;
      } catch (error) {
        logger.error("Failed to parse OpenRouter response content:", error);
        throw new InvalidResponseFormatError("Failed to parse JSON response from OpenRouter API");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error instanceof AuthenticationError ||
          error instanceof PaymentRequiredError ||
          error instanceof RateLimitError ||
          error instanceof ApiServiceError ||
          error instanceof InvalidResponseFormatError)
      ) {
        throw error;
      }
      throw new NetworkError(error instanceof Error ? error.message : "Unknown network error");
    }
  }

  /**
   * Validates and prepares candidates for database insertion
   * @param rawCandidates Raw candidates from API response
   * @param userId User ID
   * @param sourceTextHash Hash of source text
   * @returns Array of candidates ready for database insertion
   */
  private async _validateAndPrepareCandidates(
    rawCandidates: unknown[],
    userId: string,
    sourceTextHash: string
  ): Promise<AiCandidateInsert[]> {
    const result = FlashcardArraySchema.safeParse(rawCandidates);
    if (!result.success) {
      throw new ResponseValidationError("AI response validation failed", {
        validation: result.error.errors.map((e) => e.message),
      });
    }

    const candidates = result.data.map((card) => ({
      front_text: card.front.trim(),
      back_text: card.back.trim(),
      user_id: userId,
      source_text_hash: sourceTextHash,
    }));

    if (candidates.length === 0) {
      throw new EmptyValidResponseError("AI generated no valid candidates");
    }

    return candidates;
  }

  /**
   * Saves candidates and generation statistics to database
   * @param candidates Validated candidates
   * @param stats Generation statistics
   * @param supabase Supabase client
   * @returns Array of saved candidates
   */
  private async _saveCandidatesAndStats(
    candidates: AiCandidateInsert[],
    stats: GenerationStatsInsert,
    supabase: SupabaseClient
  ): Promise<AICandidateDTO[]> {
    const { data: insertedCandidates, error: insertError } = await supabase
      .from("ai_candidates")
      .insert(candidates)
      .select();

    if (insertError) {
      logger.error("Database insert error (ai_candidates):", insertError);
      throw new DatabaseError("Failed to save AI candidates to the database");
    }

    if (!insertedCandidates || insertedCandidates.length === 0) {
      throw new DatabaseError("Failed to retrieve saved AI candidates after insert");
    }

    const { error: statsError } = await supabase.from("generation_stats").insert(stats);

    if (statsError) {
      logger.error("Failed to insert generation stats:", statsError);
    }

    return insertedCandidates;
  }

  /**
   * Main method to generate flashcard candidates
   * @param sourceText Source text to generate flashcards from
   * @param userId User ID
   * @param supabase Supabase client
   * @returns Array of generated candidates
   */
  public async generateCandidates(
    sourceText: string,
    userId: string,
    supabase: SupabaseClient
  ): Promise<AICandidateDTO[]> {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    const model = import.meta.env.OPENROUTER_MODEL;

    if (!apiKey || !model) {
      throw new ConfigurationError("OpenRouter API key or model not configured");
    }

    const sourceTextHash = this._calculateMd5(sourceText);
    const jsonSchema = getJsonSchemaForFlashcards();

    const messages = [
      {
        role: "system",
        content: `You are a flashcard generation assistant. Create flashcards based on the provided text.
        Each flashcard should have a front (question/prompt) and back (answer/explanation).
        The front should be clear and concise, maximum 200 characters.
        The back should be detailed but focused, maximum 500 characters.
        Generate exactly 5 flashcards covering the most important concepts.

        You must respond with valid JSON in exactly this format and nothing else:
        [
          {
            "front": "Front text of the flashcard, maximum 200 characters",
            "back": "Back text of the flashcard, maximum 500 characters"
          },
          ...
        ]`,
      },
      {
        role: "user",
        content: sourceText,
      },
    ];

    const rawCandidates = await this._callOpenRouterAPI(messages, jsonSchema, model, apiKey);
    const validatedCandidates = await this._validateAndPrepareCandidates(rawCandidates, userId, sourceTextHash);

    const stats: GenerationStatsInsert = {
      user_id: userId,
      event_type: "generated",
      candidate_count: validatedCandidates.length,
      source_text_hash: sourceTextHash,
    };

    return this._saveCandidatesAndStats(validatedCandidates, stats, supabase);
  }
}
