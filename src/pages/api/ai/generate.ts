import type { APIContext } from "astro";
import { z } from "zod";
import type {
  GenerateFlashcardCandidatesCommand,
  GenerateAiCandidatesResponseDto, // Import DTO odpowiedzi
  ApiErrorResponseDto, // Import DTO błędu
} from "../../../types";
import { OpenRouterService } from "../../../lib/services/openRouterService";
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
} from "../../../lib/errors/openRouterErrors";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

const GenerateCommandSchema = z.object({
  sourceText: z.string().min(100, { message: "sourceText must contain at least 100 chars" }),
});

export async function POST({ request, locals }: APIContext): Promise<Response> {
  // Krok 3: Sprawdzenie uwierzytelnienia - POMINIĘTE, używamy DEFAULT_USER_ID
  const { supabase } = locals;

  // Krok 5: Walidacja danych wejściowych
  let command: GenerateFlashcardCandidatesCommand;
  try {
    const body = await request.json();
    const validationResult = GenerateCommandSchema.safeParse(body);
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Invalid input",
        errors: validationResult.error.flatten().fieldErrors,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    command = validationResult.data;
  } catch {
    const errorResponse: ApiErrorResponseDto = {
      message: "Invalid JSON body",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Krok 8 i 9: Wywołanie serwisu i obsługa odpowiedzi
  try {
    const openRouterService = new OpenRouterService();
    const candidates = await openRouterService.generateCandidates(command.sourceText, DEFAULT_USER_ID, supabase);

    const responseDto: GenerateAiCandidatesResponseDto = {
      data: candidates,
    };

    return new Response(JSON.stringify(responseDto), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/ai/generate endpoint:", error);

    let statusCode = 500;
    let errorMessage = "Internal Server Error";

    if (error instanceof ConfigurationError) {
      statusCode = 500;
      errorMessage = "AI service configuration error. Please check environment variables.";
    } else if (error instanceof NetworkError) {
      statusCode = 502;
      errorMessage = "Failed to connect to AI service. Please try again later.";
    } else if (error instanceof AuthenticationError) {
      statusCode = 401;
      errorMessage = "Authentication failed with AI service.";
    } else if (error instanceof PaymentRequiredError) {
      statusCode = 402;
      errorMessage = "AI service requires payment. Please check your OpenRouter credits.";
    } else if (error instanceof RateLimitError) {
      statusCode = 429;
      errorMessage = "AI service rate limit exceeded. Please try again later.";
    } else if (error instanceof ApiServiceError) {
      statusCode = 502;
      errorMessage = "AI service is temporarily unavailable. Please try again later.";
    } else if (
      error instanceof InvalidResponseFormatError ||
      error instanceof ResponseValidationError ||
      error instanceof EmptyValidResponseError
    ) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error instanceof DatabaseError) {
      statusCode = 500;
      errorMessage = "Database error while saving candidates.";
    }

    const errorResponse: ApiErrorResponseDto = {
      message: errorMessage,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}
