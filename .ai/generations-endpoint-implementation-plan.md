# API Endpoint Implementation Plan: Generate Flashcard Candidates

## 1. Przegląd punktu końcowego

Ten punkt końcowy (`POST /api/ai/generate`) umożliwia uwierzytelnionym użytkownikom przesyłanie tekstu źródłowego. System wykorzysta zewnętrzną usługę AI (OpenRouter) do wygenerowania potencjalnych fiszek (kandydatów) na podstawie tego tekstu. Wygenerowani kandydaci zostaną zapisani w tabeli `ai_candidates`, a zdarzenie 'generated' zostanie zarejestrowane w tabeli `generation_stats`. Punkt końcowy zwróci listę utworzonych kandydatów.

## 2. Szczegóły żądania

- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/ai/generate`
- **Parametry:** Brak parametrów URL lub zapytania.
- **Request Body:**
  - **Typ zawartości:** `application/json`
  - **Struktura:**

    ```json
    {
      "sourceText": "string" 
    }
    ```

  - **Walidacja:** `sourceText` musi być niepustym ciągiem znaków. (Potencjalne ograniczenie maksymalnej długości do rozważenia).

## 3. Wykorzystywane typy

- `src/types.ts`:
  - `GenerateAiCandidatesCommand`: Definiuje strukturę ciała żądania.
  - `AiCandidateDto`: Definiuje strukturę każdego kandydata w odpowiedzi.
  - `GenerateAiCandidatesResponseDto`: Definiuje strukturę pomyślnej odpowiedzi.
  - `ApiErrorResponseDto`: Definiuje strukturę odpowiedzi błędu.
- `src/db/database.types.ts`:
  - `TablesInsert<'ai_candidates'>`: Typ dla wstawiania danych do tabeli `ai_candidates`.
  - `TablesInsert<'generation_stats'>`: Typ dla wstawiania danych do tabeli `generation_stats`.

## 4. Szczegóły odpowiedzi

- **Pomyślna odpowiedź (Kod statusu: `201 Created`):**
  - **Typ zawartości:** `application/json`
  - **Struktura:**

    ```json
    {
      "data": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "front_text": "string",
          "back_text": "string",
          "source_text_hash": "string",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
        // ... więcej obiektów AiCandidateDto
      ]
    }
    ```

- **Odpowiedzi błędów:**
  - **Kod statusu: `400 Bad Request`:** Nieprawidłowe dane wejściowe (np. brak `sourceText`, pusty `sourceText`, błąd z usługi AI, wygenerowany tekst przekracza limity bazy danych). Ciało odpowiedzi powinno używać `ApiErrorResponseDto`.
  - **Kod statusu: `401 Unauthorized`:** Użytkownik nie jest uwierzytelniony. Odpowiedź zarządzana przez middleware lub zwrócona przez punkt końcowy, jeśli middleware nie przechwyci.
  - **Kod statusu: `402 Payment Required`:** Niewystarczające środki lub kredyty w usłudze AI (np. OpenRouter). Odpowiedź powinna informować o konieczności doładowania konta.
  - **Kod statusu: `429 Too Many Requests`:** Przekroczono limit żądań (jeśli zaimplementowano). Ciało odpowiedzi powinno używać `ApiErrorResponseDto`.
  - **Kod statusu: `500 Internal Server Error`:** Błędy bazy danych, nieoczekiwane błędy usługi AI lub inne błędy serwera. Ciało odpowiedzi powinno używać `ApiErrorResponseDto`.
  - **Kod statusu: `502 Bad Gateway`:** Błędy komunikacji z zewnętrzną usługą AI (np. niedostępność OpenRouter). Ciało odpowiedzi powinno używać `ApiErrorResponseDto`.

## 5. Przepływ danych

1. Żądanie `POST` trafia do `/api/ai/generate`.
2. Middleware Astro (`src/middleware/index.ts`) weryfikuje token JWT Supabase. Jeśli jest nieprawidłowy, zwraca `401` lub przekierowuje. Jeśli jest prawidłowy, dołącza `user` i `supabase` do `context.locals`.
3. Handler punktu końcowego (`src/pages/api/ai/generate.ts`) jest wywoływany.
4. Handler sprawdza, czy `context.locals.user` istnieje. Jeśli nie, zwraca `401`.
5. Handler odczytuje ciało żądania JSON.
6. Handler używa `zod` do walidacji ciała żądania względem schematu `GenerateAiCandidatesCommand`. Jeśli walidacja nie powiodła się, zwraca `400` z `ApiErrorResponseDto`.
7. Handler wywołuje dedykowaną funkcję serwisową (np. `generateCandidates` w `src/lib/services/aiGenerationService.ts`), przekazując `sourceText` i `userId` (`context.locals.user.id`) oraz klienta `supabase` (`context.locals.supabase`).
8. **Wewnątrz usługi (`aiGenerationService.ts`):**
    a.  Oblicza skrót (np. SHA-256) `sourceText` w celu uzyskania `source_text_hash`.
    b.  Wywołuje zewnętrzną usługę AI (OpenRouter) z `sourceText` i odpowiednim promptem do generowania par fiszek (front/back). Obsługuje klucz API OpenRouter z zmiennych środowiskowych.
    c.  Przechwytuje potencjalne błędy z usługi AI (błędy sieciowe, błędy API, błędy limitu żądań, błędy moderacji treści).
    d.  Parsuje odpowiedź AI. Sprawdza, czy wygenerowane `front_text` i `back_text` nie przekraczają limitów bazy danych (`VARCHAR(200)` i `VARCHAR(500)`). Jeśli przekraczają, zgłasza błąd (który spowoduje odpowiedź `400`).
    e.  Przygotowuje listę obiektów `TablesInsert<'ai_candidates'>`, ustawiając `user_id`, `front_text`, `back_text` i `source_text_hash` dla każdego kandydata.
    f.  Wstawia kandydatów do tabeli `ai_candidates` za pomocą klienta `supabase`. Przechwytuje błędy bazy danych.
    g.  Jeśli wstawianie kandydatów powiodło się, przygotowuje obiekt `TablesInsert<'generation_stats'>` z `user_id`, `event_type = 'generated'`, `candidate_count` (liczba pomyślnie wstawionych kandydatów) i `source_text_hash`.
    h.  Wstawia wpis statystyk do tabeli `generation_stats`. Przechwytuje błędy bazy danych (ale niepowodzenie tutaj nie powinno cofać tworzenia kandydatów dla MVP).
    i.  Zwraca listę pomyślnie wstawionych obiektów `AiCandidateDto` (pobranych z wyniku wstawiania).
9. Handler punktu końcowego otrzymuje wynik z usługi.
10. Jeśli usługa zwróciła błąd, handler mapuje go na odpowiedni kod statusu HTTP (`400` lub `500`) i zwraca `ApiErrorResponseDto`.
11. Jeśli usługa powiodła się, handler formatuje odpowiedź jako `GenerateAiCandidatesResponseDto` i zwraca ją z kodem statusu `201 Created`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Middleware musi rygorystycznie weryfikować tokeny JWT Supabase. Punkt końcowy musi potwierdzić obecność `context.locals.user`.
- **Autoryzacja:** Wszystkie operacje na bazie danych (wstawianie do `ai_candidates` i `generation_stats`) muszą używać `user_id` z uwierzytelnionego tokenu (`context.locals.user.id`). Polegać na politykach RLS Supabase, aby zapewnić, że użytkownicy mogą tworzyć zasoby tylko dla siebie.
- **Walidacja danych wejściowych:** Użyj `zod` do walidacji `sourceText`. Rozważ ograniczenie maksymalnej długości, aby zapobiec nadużyciom i potencjalnym atakom DoS na usługę AI. Bądź świadomy potencjalnych ataków typu prompt injection na usługę AI.
- **Zarządzanie kluczami API i kredytami:** 
  - Klucz API OpenRouter musi być bezpiecznie przechowywany jako zmienna środowiskowa po stronie serwera i nigdy nie może być ujawniony po stronie klienta.
  - Należy monitorować stan kredytów/środków w usłudze AI i odpowiednio obsługiwać błędy 402 Payment Required.
  - Rozważyć implementację powiadomień administracyjnych o niskim stanie kredytów.
- **Limitowanie żądań:** Zaimplementuj limitowanie żądań (np. za pomocą zewnętrznej usługi lub niestandardowej logiki), aby zapobiec nadużyciom punktu końcowego i usługi AI, zwracając `429 Too Many Requests`.
- **Obsługa błędów zewnętrznych:** Bezpiecznie obsługuj błędy z usługi AI OpenRouter, unikając ujawniania wrażliwych informacji w komunikatach o błędach dla klienta.

## 7. Rozważania dotyczące wydajności

- **Czas odpowiedzi usługi AI:** Wywołanie zewnętrznej usługi AI jest głównym czynnikiem wpływającym na czas odpowiedzi. Operacja jest synchroniczna dla MVP, co może prowadzić do długich czasów oczekiwania dla użytkownika.
- **Operacje na bazie danych:** Wstawianie wielu kandydatów i wpisu statystyk obejmuje wiele operacji zapisu. Użyj metody `insert()` Supabase, która może obsługiwać tablice w celu potencjalnej optymalizacji wstawiania kandydatów.
- **Obliczanie skrótu:** Obliczanie skrótu `sourceText` jest stosunkowo szybkie, ale powinno być wykonywane po stronie serwera.
- **Rozmiar ładunku:** Duże `sourceText` lub duża liczba wygenerowanych kandydatów może zwiększyć rozmiar żądania/odpowiedzi i zużycie pamięci.

## 8. Etapy wdrożenia

1. **Utwórz plik endpointu:** Utwórz `src/pages/api/ai/generate.ts`.
2. **Zaimplementuj obsługę POST:** Dodaj funkcję `export async function POST({ request, locals }: APIContext)` w pliku endpointu. Ustaw `export const prerender = false;`.
3. **Sprawdzenie uwierzytelnienia:** Dodaj logikę sprawdzającą `locals.user` na początku handlera POST. Zwróć `401`, jeśli brakuje.
4. **Zdefiniuj schemat Zod:** W pliku endpointu lub w dedykowanym pliku schematów (`src/lib/schemas.ts`) zdefiniuj schemat `zod` dla `GenerateAiCandidatesCommand` (wymagający niepustego `sourceText`).
5. **Walidacja danych wejściowych:** W handlerze POST odczytaj ciało żądania, sparsuj JSON i użyj schematu `zod` do walidacji. Zwróć `400` z `ApiErrorResponseDto`, jeśli walidacja nie powiodła się.
6. **Utwórz plik serwisu:** Utwórz `src/lib/services/aiGenerationService.ts`.
7. **Zaimplementuj logikę serwisu:**
    - Utwórz funkcję `generateCandidates(sourceText: string, userId: string, supabase: SupabaseClient): Promise<AiCandidateDto[]>`.
    - Zaimplementuj obliczanie `source_text_hash` (np. używając `crypto.subtle` lub biblioteki `crypto`).
    - Zaimplementuj wywołanie API OpenRouter (używając `fetch`), pobierając klucz API ze zmiennych środowiskowych (`import.meta.env.OPENROUTER_API_KEY`).
    - Dodaj obsługę błędów dla wywołania API OpenRouter.
    - Sparsuj odpowiedź AI i sprawdź limity długości tekstu. Zgłoś błąd, jeśli limity zostaną przekroczone.
    - Zaimplementuj wstawianie do `ai_candidates` za pomocą `supabase.from('ai_candidates').insert([...]).select()`.
    - Zaimplementuj wstawianie do `generation_stats` za pomocą `supabase.from('generation_stats').insert({...})`.
    - Dodaj bloki `try...catch` wokół operacji AI i bazy danych, aby obsłużyć błędy i odpowiednio je zgłosić lub zwrócić.
    - Zwróć listę utworzonych `AiCandidateDto` w przypadku powodzenia.
8. **Wywołaj serwis z endpointu:** W handlerze POST wywołaj funkcję `generateCandidates` z `aiGenerationService`, przekazując wymagane parametry (`sourceText`, `userId`, `locals.supabase`).
9. **Obsługa odpowiedzi:** W handlerze POST:
    - Użyj bloku `try...catch` wokół wywołania serwisu.
    - W bloku `catch` mapuj błędy zgłoszone przez serwis na odpowiedzi `400` lub `500` z `ApiErrorResponseDto`.
    - W przypadku powodzenia sformatuj wynik jako `GenerateAiCandidatesResponseDto` i zwróć go z kodem statusu `201`.
10. **Zmienne środowiskowe:** Upewnij się, że `OPENROUTER_API_KEY` jest zdefiniowany w pliku `.env`.
12. **Dokumentacja:** (Opcjonalnie) Zaktualizuj dokumentację API, jeśli jest to konieczne.
