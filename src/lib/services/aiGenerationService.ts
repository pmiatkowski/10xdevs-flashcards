import { createHash } from "node:crypto"; // Import dla MD5
import type { SupabaseClient } from "../../db/supabase.client"; // Upewnij się, że ścieżka jest poprawna
import type { AICandidateDTO } from "../../types"; // Upewnij się, że ścieżka jest poprawna
import type { Database } from "../../db/database.types";
import { logger } from "../../lib/utils"; // Import logger utility

// Typ dla wstawiania danych do tabeli ai_candidates
type AiCandidateInsert = Database["public"]["Tables"]["ai_candidates"]["Insert"];
// Typ dla wstawiania danych do tabeli generation_stats
type GenerationStatsInsert = Database["public"]["Tables"]["generation_stats"]["Insert"];

// Definicja typu dla oczekiwanej odpowiedzi z OpenRouter
interface OpenRouterCandidate {
  front: string;
  back: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string; // Oczekujemy, że content będzie stringiem JSON
    };
  }[];
}

interface OpenRouterErrorResponse {
  error?: {
    message?: string;
    code?: number;
  };
}

/**
 * Oblicza skrót MD5 dla podanego tekstu.
 * @param text Tekst do haszowania.
 * @returns Skrót MD5 w formacie heksadecymalnym.
 */
function calculateMd5(text: string): string {
  return createHash("md5").update(text).digest("hex");
}

/**
 * Wywołuje API OpenRouter w celu wygenerowania kandydatów na fiszki.
 * @param sourceText Tekst źródłowy.
 * @returns Obietnica, która rozwiązuje się do sparsowanej odpowiedzi AI.
 * @throws Rzuca błąd w przypadku problemów z siecią lub API.
 */
async function callOpenRouterAPI(sourceText: string): Promise<OpenRouterCandidate[]> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured.");
  }
  const model = import.meta.env.OPENROUTER_MODEL;
  if (!model) {
    throw new Error("OpenRouter model is not configured.");
  }

  // Prosty prompt - do dopracowania
  const prompt = `Based on a given text, generate list of 5 flashcards (front and back).
  Respond nothing else but JSON formatted array of objects with front and back text.
  Each object should have the following structure:
  [
    {
      "front": "Front text of the flashcard, maximum 200 characters",
      "back": "Back text of the flashcard, maximum 500 characters"
    },
    ...
  ]
  The front text should be a question or prompt, and the back text should be the answer or explanation.
  The front text should be less than 200 characters and the back text should be less than 500 characters.
  The front text should be unique and not contain any HTML tags or special characters.
  The back text should be unique and not contain any HTML tags or special characters.
  The front text should not contain any special characters.
  The back text should not contain any special characters.
  The response should be a JSON array of objects with the keys "front" and "back".

  Do not include any additional text or explanations.
  Do not add any markdown or code blocks.

  Text:
  ${sourceText}
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/10xdevs", // Wymagane przez OpenRouter
        "X-Title": "Fiszki", // Wymagane przez OpenRouter
      },
      body: JSON.stringify({
        model, // Zmieniono na model z darmową warstwą
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // Prośba o odpowiedź JSON
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

      // Mapowanie kodów błędów na konkretne wyjątki
      switch (response.status) {
        case 402:
          throw new Error(`OpenRouter API payment required: ${errorMessage}`);
        case 429:
          throw new Error(`OpenRouter API rate limit exceeded: ${errorMessage}`);
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error(`OpenRouter API service error (${response.status}): ${errorMessage}`);
        default:
          throw new Error(`OpenRouter API error (${response.status}): ${errorMessage}`);
      }
    }

    const data: OpenRouterResponse = await response.json();

    logger.debug("OpenRouter API response:", data.choices[0].message.content);
    // Sprawdzenie, czy odpowiedź zawiera oczekiwane dane
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      logger.error("Invalid OpenRouter response structure:", data);
      throw new Error("Invalid response structure from OpenRouter API.");
    }

    // Parsowanie stringa JSON z pola content
    try {
      const candidates: OpenRouterCandidate[] = JSON.parse(data.choices[0].message.content);
      // Podstawowa walidacja typu
      if (
        !Array.isArray(candidates) ||
        candidates.some((c) => typeof c.front !== "string" || typeof c.back !== "string")
      ) {
        throw new Error("Parsed content is not an array of {front, back} objects.");
      }
      return candidates;
    } catch (parseError) {
      logger.error("Failed to parse OpenRouter response content:", parseError);
      logger.error("Raw content:", data.choices[0].message.content);
      throw new Error("Failed to parse JSON response from OpenRouter API.");
    }
  } catch (error) {
    logger.error("Error calling OpenRouter API:", error);
    // Rzucenie błędu dalej z zachowaniem oryginalnej wiadomości
    throw error instanceof Error ? error : new Error("An unknown error occurred while calling the AI service.");
  }
}

// Limity długości z bazy danych
const MAX_FRONT_TEXT_LENGTH = 200;
const MAX_BACK_TEXT_LENGTH = 500;

/**
 * Waliduje kandydatów otrzymanych z AI i przygotowuje ich do wstawienia do bazy danych.
 * @param rawCandidates Surowi kandydaci z API AI.
 * @param userId ID użytkownika.
 * @param source_text_hash Skrót tekstu źródłowego.
 * @returns Tablica kandydatów gotowych do wstawienia.
 * @throws Rzuca błąd, jeśli którykolwiek kandydat jest nieprawidłowy (np. przekracza limit długości).
 */
function validateAndPrepareCandidates(
  rawCandidates: OpenRouterCandidate[],
  userId: string,
  source_text_hash: string
): AiCandidateInsert[] {
  const preparedCandidates: AiCandidateInsert[] = [];
  const validationErrors: string[] = [];

  console.warn("RAW CANDIDATES:", rawCandidates);

  rawCandidates.forEach((candidate, index) => {
    const front_text = candidate.front?.trim();
    const back_text = candidate.back?.trim();

    // Pomijanie pustych kandydatów
    if (!front_text || !back_text) {
      logger.warn(`Skipping empty candidate at index ${index}`);
      return;
    }

    // Walidacja długości
    if (front_text.length > MAX_FRONT_TEXT_LENGTH) {
      validationErrors.push(`Candidate ${index + 1} front_text exceeds ${MAX_FRONT_TEXT_LENGTH} characters.`);
    }
    if (back_text.length > MAX_BACK_TEXT_LENGTH) {
      validationErrors.push(`Candidate ${index + 1} back_text exceeds ${MAX_BACK_TEXT_LENGTH} characters.`);
    }

    if (validationErrors.length === 0) {
      preparedCandidates.push({
        front_text,
        back_text,
        user_id: userId,
        source_text_hash: source_text_hash,
      });
    }
  });

  if (validationErrors.length > 0) {
    // Jeśli są błędy walidacji, rzuć błąd, który zostanie przechwycony jako 400 Bad Request
    throw new Error(`AI response validation failed: ${validationErrors.join(" ")}`);
  }

  if (preparedCandidates.length === 0 && rawCandidates.length > 0) {
    throw new Error("AI generated candidates but all were empty or invalid after trimming.");
  }
  logger.debug(`Prepared ${preparedCandidates.length} candidates for insertion after validation.`);
  return preparedCandidates;
}

/**
 * Generuje kandydatów na fiszki AI na podstawie tekstu źródłowego,
 * zapisuje ich w bazie danych i rejestruje statystyki.
 *
 * @param sourceText Tekst źródłowy do generowania fiszek.
 * @param userId ID użytkownika.
 * @param supabase Klient Supabase.
 * @returns Obietnica, która rozwiązuje się do tablicy utworzonych AiCandidateDto.
 * @throws Rzuca błąd, jeśli wystąpi problem z API AI lub bazą danych.
 */
export async function generateCandidates(
  sourceText: string,
  userId: string,
  supabase: SupabaseClient
): Promise<AICandidateDTO[]> {
  logger.info("Generating candidates for user:", userId);

  // Krok 7a: Obliczanie skrótu source_text_hash (zmieniono na MD5)
  const source_text_hash = calculateMd5(sourceText);
  logger.info("Source text hash (MD5):", source_text_hash);

  // Krok 7b: Wywołanie zewnętrznej usługi AI (OpenRouter)
  let rawCandidates: OpenRouterCandidate[];
  try {
    rawCandidates = await callOpenRouterAPI(sourceText);
    logger.info(`Received ${rawCandidates.length} raw candidates from AI.`);
  } catch (error) {
    // Przekazanie błędu z API AI do endpointu
    // Można tu dodać bardziej szczegółowe logowanie lub mapowanie błędów
    throw new Error(`AI service failed: ${error instanceof Error ? error.message : "Unknown AI error"}`);
  }

  // Krok 7d: Walidacja odpowiedzi AI i przygotowanie do wstawienia
  const candidatesToInsert = validateAndPrepareCandidates(rawCandidates, userId, source_text_hash);
  if (candidatesToInsert.length === 0) {
    logger.info("No valid candidates generated by AI.");
    return []; // Zwróć pustą tablicę, jeśli AI nic nie wygenerowało lub wszystko było nieprawidłowe
  }
  logger.info(`Validated ${candidatesToInsert.length} candidates for insertion.`);

  // Krok 7f: Wstawienie kandydatów do tabeli ai_candidates
  logger.info(`Attempting to insert ${candidatesToInsert.length} candidates into DB.`);
  const { data: insertedCandidates, error: insertError } = await supabase
    .from("ai_candidates")
    .insert(candidatesToInsert)
    .select(); // Pobierz wstawione wiersze

  if (insertError) {
    logger.error("Database insert error (ai_candidates):", insertError);
    // Rzucenie błędu, który zostanie przechwycony jako 500 Internal Server Error
    throw new Error("Failed to save AI candidates to the database.");
  }

  if (!insertedCandidates || insertedCandidates.length === 0) {
    // To nie powinno się zdarzyć, jeśli insert nie zwrócił błędu, ale sprawdzamy dla pewności
    logger.error("No candidates returned after successful insert operation.");
    throw new Error("Failed to retrieve saved AI candidates after insert.");
  }

  const candidateCount = insertedCandidates.length;
  logger.info(`Successfully inserted ${candidateCount} candidates into DB.`);

  // Krok 7g: Przygotowanie obiektu TablesInsert<'generation_stats'>
  const statsToInsert: GenerationStatsInsert = {
    user_id: userId,
    event_type: "generated",
    candidate_count: candidateCount,
    source_text_hash: source_text_hash,
  };

  // Krok 7h: Wstawienie wpisu statystyk do tabeli generation_stats
  logger.info("Inserting generation stats:", statsToInsert);
  const { error: statsError } = await supabase.from("generation_stats").insert(statsToInsert);

  if (statsError) {
    // Logowanie błędu, ale nie przerywanie przepływu dla MVP
    logger.error("Failed to insert generation stats:", statsError);
    // Nie rzucamy tutaj błędu, aby nie blokować odpowiedzi dla użytkownika
  }

  // Krok 7i: Zwrócenie listy pomyślnie wstawionych obiektów AiCandidateDto
  // Zwracamy dane bezpośrednio z wyniku operacji .select()
  return insertedCandidates;
}

// TODO: Implementacja funkcji pomocniczych: parseAIResponse, validateCandidateLengths
