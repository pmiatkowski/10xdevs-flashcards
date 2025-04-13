# OpenRouter Service Implementation Plan

## 1. Description

This document outlines the implementation plan for an `OpenRouterService` within the AI Flashcards application. The service will encapsulate the logic for interacting with the OpenRouter API to generate flashcard candidates based on user-provided text. It will handle prompt construction, API communication, response parsing, validation, and error handling, integrating with the existing Supabase backend for data persistence.

## 2. Constructor

The service might not require a traditional constructor if implemented as a collection of functions. However, if structured as a class, the constructor could handle initial setup, though dependency injection (like the Supabase client) is preferred via function arguments. Configuration (API key, model) will be accessed directly from environment variables (`import.meta.env`) within the relevant functions.

## 3. Public Methods and Fields

- **`generateCandidates(sourceText: string, userId: string, supabase: SupabaseClient): Promise<AICandidateDTO[]>`**
  - **Description:** The main public method orchestrating the flashcard generation process.
  - **Functionality:**
        1. Calculates the MD5 hash of `sourceText`.
        2. Retrieves configuration (API key, model name) from environment variables.
        3. Constructs the system and user prompts.
        4. Defines the expected JSON schema for the response.
        5. Calls the private `_callOpenRouterAPI` method with the prompts, schema, and configuration.
        6. Calls the private `_validateAndPrepareCandidates` method to validate the AI response against the schema and business rules (length constraints).
        7. If validation is successful, calls the private `_saveCandidatesAndStats` method to persist the data.
        8. Returns the array of successfully saved `AICandidateDTO` objects.
  - **Dependencies:** `SupabaseClient`, `_callOpenRouterAPI`, `_validateAndPrepareCandidates`, `_saveCandidatesAndStats`, `_calculateMd5`, environment variables.

## 4. Private Methods and Fields

- **`_callOpenRouterAPI(messages: Array<{role: string, content: string}>, jsonSchema: object, model: string, apiKey: string, params?: object): Promise<OpenRouterCandidate[]>`**
  - **Description:** Handles the direct HTTP request to the OpenRouter `/chat/completions` endpoint.
  - **Functionality:**
        1. Constructs the request body including `model`, `messages`, `response_format` (using `type: 'json_schema'` and the provided `jsonSchema`), and optional `params` (like `temperature`).
        2. Sets required headers: `Authorization`, `Content-Type`, `HTTP-Referer`, `X-Title`.
        3. Uses `fetch` to make the POST request.
        4. Handles HTTP response status codes, throwing specific errors for 4xx/5xx responses (e.g., `PaymentRequiredError`, `RateLimitError`, `AuthenticationError`, `ApiServiceError`).
        5. Parses the `content` string from the successful response's `choices[0].message` as JSON.
        6. Catches JSON parsing errors, throwing `InvalidResponseFormatError`.
        7. Returns the parsed array of raw candidates.
  - **Dependencies:** `fetch`, environment variables.
  - **Refinement:** Modify the existing `callOpenRouterAPI` to accept the JSON schema and parameters, use `json_schema` type, and throw typed errors.

- **`_validateAndPrepareCandidates(rawCandidates: any[], userId: string, sourceTextHash: string, schema: z.ZodSchema): AiCandidateInsert[]`**
  - **Description:** Validates the raw data received from the API against a Zod schema and prepares it for database insertion.
  - **Functionality:**
        1. Uses the provided Zod `schema` (e.g., `FlashcardArraySchema`) to parse and validate `rawCandidates`.
        2. Catches Zod validation errors, throwing `ResponseValidationError` with details.
        3. Maps the validated candidates to the `AiCandidateInsert` type, adding `user_id` and `source_text_hash`.
        4. Filters out any potentially empty candidates *if* the schema allows optional fields (though the target schema requires `front` and `back`).
        5. Throws an error if validation passes but results in an empty array (e.g., `EmptyValidResponseError`).
  - **Dependencies:** Zod library.
  - **Refinement:** Replace the manual validation logic in the existing `validateAndPrepareCandidates` with Zod schema validation. The Zod schema should include length checks (`.max()`).

- **`_saveCandidatesAndStats(candidates: AiCandidateInsert[], stats: GenerationStatsInsert, supabase: SupabaseClient): Promise<AICandidateDTO[]>`**
  - **Description:** Inserts validated candidates and generation statistics into the database.
  - **Functionality:**
        1. Uses `supabase.from('ai_candidates').insert(candidates).select()` to save candidates.
        2. Throws `DatabaseError` if the insert fails.
        3. Uses `supabase.from('generation_stats').insert(stats)` to save statistics.
        4. Logs errors during stats insertion but does not throw, allowing the main flow to succeed.
        5. Returns the selected data from the candidate insertion.
  - **Dependencies:** `SupabaseClient`.
  - **Refinement:** Combine the insertion logic from the existing `generateCandidates` function into this dedicated private method. Ensure proper error handling for the candidate insertion.

- **`_calculateMd5(text: string): string`**
  - **Description:** Calculates the MD5 hash of a string.
  - **Functionality:** Uses `node:crypto`'s `createHash('md5')`.
  - **Dependencies:** `node:crypto`.
  - **Refinement:** Keep the existing implementation.

- **`_getJsonSchemaForFlashcards(): object`**
  - **Description:** Defines or generates the JSON schema object required for the `response_format` API parameter.
  - **Functionality:**
        1. Defines a Zod schema (e.g., `FlashcardArraySchema` with nested `FlashcardSchema` including descriptions and constraints like `max` length).
        2. Uses a library like `zod-to-json-schema` to convert the Zod schema into a JSON schema object compatible with the OpenRouter API.
        3. Returns the generated JSON schema object.
  - **Dependencies:** Zod, `zod-to-json-schema` (needs installation).

- **Custom Error Classes:**
  - `ConfigurationError extends Error`
  - `NetworkError extends Error`
  - `AuthenticationError extends Error`
  - `PaymentRequiredError extends Error`
  - `RateLimitError extends Error`
  - `ApiServiceError extends Error` (for general 5xx or unexpected API errors)
  - `InvalidResponseFormatError extends Error` (JSON parsing failed)
  - `ResponseValidationError extends Error` (Schema or business rule validation failed)
  - `DatabaseError extends Error`
  - `EmptyValidResponseError extends Error`

## 5. Error Handling

- **Configuration:** Check for `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` at the start of `generateCandidates`. Throw `ConfigurationError` if missing.
- **API Calls (`_callOpenRouterAPI`):**
  - Wrap `fetch` in `try...catch` for network errors (throw `NetworkError`).
  - Check `response.ok`. If `false`, check status codes:
    - 401/403: Throw `AuthenticationError`.
    - 402: Throw `PaymentRequiredError`.
    - 429: Throw `RateLimitError`.
    - 5xx: Throw `ApiServiceError`.
    - Other 4xx: Throw `ApiServiceError` or `BadRequestError`.
  - Wrap `response.json()` and subsequent `JSON.parse()` in `try...catch` (throw `InvalidResponseFormatError`).
- **Validation (`_validateAndPrepareCandidates`):**
  - Wrap Zod parsing/validation in `try...catch` (throw `ResponseValidationError`).
- **Database (`_saveCandidatesAndStats`):**
  - Check for `error` in the Supabase response for candidate insertion (throw `DatabaseError`).
  - Log errors from stats insertion but don't throw.
- **API Route (`/api/ai/generate.ts`):**
  - Wrap the call to `generateCandidates` in `try...catch`.
  - Catch specific custom error types and map them to appropriate HTTP status codes (400, 401, 402, 429, 500, 502) and user-friendly JSON error responses (`ApiErrorResponseDto`).

## 6. Security Considerations

- **API Key:** Store `OPENROUTER_API_KEY` securely in environment variables. Never commit it to version control. Use `.env` locally and environment variable management in deployment.
- **Input Sanitization:** While the primary input is user text for flashcard generation, be mindful of potential prompt injection if user input directly influences the system prompt structure (which it shouldn't in this design). Rely on the user message content for input.
- **Resource Limiting:** OpenRouter allows setting spending limits. Implement rate limiting on the API endpoint (`/api/ai/generate.ts`) if necessary to prevent abuse, potentially based on user ID or IP address (requires more infrastructure).
- **Data Privacy:** Ensure compliance with privacy regulations regarding the user-provided `sourceText` sent to the third-party API (OpenRouter). Inform users about this data transfer.
- **Dependency Security:** Keep dependencies (Astro, React, Supabase client, Zod, etc.) updated to patch vulnerabilities.

## 7. Step-by-step Implementation Plan

1. **Install Dependencies:**
    - If not already present, add Zod: `npm install zod`
    - Add library for Zod to JSON Schema conversion: `npm install zod-to-json-schema`

2. **Update Environment Variables:**
    - Ensure `d:\10xdevs\fiszki\.env` (and `.env.example`) includes `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.

    ```bash
    # .env.example
    SUPABASE_URL=###
    SUPABASE_KEY=###
    OPENROUTER_API_KEY=###
    OPENROUTER_MODEL="mistralai/mistral-7b-instruct" # Or another preferred model
    ```

3. **Define Zod Schemas and JSON Schema Generation:**
    - In `aiGenerationService.ts` or a dedicated types file:
        - Define `FlashcardSchema = z.object({ front: z.string().max(200).describe(...), back: z.string().max(500).describe(...) })`.
        - Define `FlashcardArraySchema = z.array(FlashcardSchema).min(1).max(5).describe(...)`.
    - Implement `_getJsonSchemaForFlashcards()` using `zod-to-json-schema` to generate the schema object needed for the API call.

4. **Refactor `aiGenerationService.ts`:**
    - Define the custom error classes listed in section 4.
    - Implement `_calculateMd5` (keep existing).
    - Implement `_getJsonSchemaForFlashcards`.
    - Refactor `callOpenRouterAPI` into `_callOpenRouterAPI`:
        - Accept `messages`, `jsonSchema`, `model`, `apiKey`, `params`.
        - Read `HTTP-Referer` and `X-Title` from constants or env vars if needed.
        - Construct the request body with `response_format: { type: 'json_schema', json_schema: { name: 'flashcard_generator', strict: true, schema: jsonSchema } }`.
        - Implement robust error handling using `fetch` response status and `try...catch`, throwing the custom error types.
    - Refactor `validateAndPrepareCandidates` into `_validateAndPrepareCandidates`:
        - Accept `rawCandidates`, `userId`, `sourceTextHash`, and the Zod `FlashcardArraySchema`.
        - Use `schema.safeParse()` for validation.
        - Throw `ResponseValidationError` on failure, including `error.flatten()` details.
        - Map successful data to `AiCandidateInsert[]`.
        - Throw `EmptyValidResponseError` if the result is empty.
    - Implement `_saveCandidatesAndStats`:
        - Move database insertion logic here.
        - Handle candidate insert errors by throwing `DatabaseError`.
        - Log stats insert errors but don't throw.
    - Implement `generateCandidates`:
        - Orchestrate the calls to private methods.
        - Retrieve config (`apiKey`, `model`) from `import.meta.env`.
        - Construct system and user messages.
        - Call `_getJsonSchemaForFlashcards`.
        - Handle potential `ConfigurationError`.
        - Wrap calls to other private methods in `try...catch` if necessary, although errors should propagate up.

5. **Refactor API Route (`src/pages/api/ai/generate.ts`):**
    - Update the `import` for `generateCandidates` service.
    - Keep the `GenerateCommandSchema` for request body validation.
    - In the main `try...catch` block:
        - Call `generateCandidates(command.sourceText, DEFAULT_USER_ID, supabase)`.
        - Replace the large `if (error instanceof Error)` block with a `catch (error)` block that checks the type of error using `instanceof` for the custom error classes defined in the service.
        - Map each custom error type (`ConfigurationError`, `PaymentRequiredError`, `RateLimitError`, `ResponseValidationError`, `DatabaseError`, `ApiServiceError`, etc.) to the appropriate HTTP status code (400, 402, 429, 500, 502) and a user-friendly `ApiErrorResponseDto`.
        - Include specific validation details in the response for `ResponseValidationError` if possible.

6. **Testing:**
    - Add unit/integration tests for the `aiGenerationService`, mocking `fetch` and the Supabase client.
    - Test different scenarios: successful generation, API errors (4xx, 5xx), invalid AI response (malformed JSON, schema mismatch), database errors.
    - Perform end-to-end testing via the UI or API client.

7. **Documentation:**
    - Update any relevant READMEs or internal documentation regarding the OpenRouter integration and environment variable requirements.
    - Ensure comments in the code explain complex logic, especially around prompt engineering and schema validation.
