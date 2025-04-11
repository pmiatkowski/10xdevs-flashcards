import type { APIContext } from "astro";
import { z } from "zod";
import type {
  GenerateFlashcardCandidatesCommand,
  GenerateAiCandidatesResponseDto, // Import DTO odpowiedzi
  ApiErrorResponseDto, // Import DTO błędu
} from "../../../types";
import { generateCandidates } from "../../../lib/services/aiGenerationService"; // Import serwisu
import { DEFAULT_USER_ID } from "../../../db/supabase.client"; // Import domyślnego ID użytkownika

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
  } catch (error) {
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
    // Użycie DEFAULT_USER_ID zamiast user.id
    const candidates = await generateCandidates(command.sourceText, DEFAULT_USER_ID, supabase);

    const responseDto: GenerateAiCandidatesResponseDto = {
      data: candidates,
    };

    return new Response(JSON.stringify(responseDto), {
      status: 201, // Created
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/ai/generate endpoint:", error);

    let statusCode = 500;
    let errorMessage = "Internal Server Error";

    if (error instanceof Error) {
      const errorMsg = error.message;

      // Błędy związane z OpenRouter API
      if (errorMsg.includes("payment required")) {
        statusCode = 402; // Payment Required
        errorMessage = "AI service requires payment. Please check your OpenRouter credits.";
      } else if (errorMsg.includes("rate limit exceeded")) {
        statusCode = 429; // Too Many Requests
        errorMessage = "AI service rate limit exceeded. Please try again later.";
      } else if (errorMsg.includes("service error")) {
        statusCode = 502; // Bad Gateway
        errorMessage = "AI service is temporarily unavailable. Please try again later.";
      }
      // Błędy walidacji i parsowania
      else if (
        errorMsg.includes("AI response validation failed:") ||
        errorMsg.includes("Parsed content is not an array") ||
        errorMsg.includes("Failed to parse JSON response") ||
        errorMsg.includes("AI generated candidates but all were empty")
      ) {
        statusCode = 400; // Bad Request
        errorMessage = errorMsg; // Używamy oryginalnej wiadomości dla błędów walidacji
      }
      // Błędy bazy danych
      else if (errorMsg.includes("Failed to save AI candidates")) {
        statusCode = 500; // Internal Server Error
        errorMessage = "Database error while saving candidates.";
      }
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
