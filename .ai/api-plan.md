# REST API Plan

This document outlines the REST API design for the Fiszki AI application, based on the provided database schema, Product Requirements Document (PRD), and technology stack.

## 1. Resources

| Resource        | Description                                       | Database Table(s)   |
| :-------------- | :------------------------------------------------ | :------------------ |
| `Flashcards`    | Represents user-owned flashcards (manual or AI).  | `flashcards`        |
| `AICandidates`  | Represents AI-generated flashcard suggestions.    | `ai_candidates`     |
| `AIGeneration`  | Represents the AI generation process trigger.     | `ai_candidates`, `generation_stats` |
| `Stats`         | Represents user-specific statistics.              | `generation_stats`  |
| `User`          | Represents the authenticated user's account.      | `auth.users` (via Supabase) |

## 2. Endpoints

All endpoints require authentication via Supabase JWT unless otherwise specified. User-specific data is automatically scoped based on the authenticated user's ID (`auth.uid()`) enforced by RLS policies.

---

### 2.1 Flashcards (`/flashcards`)

Manages user's saved flashcards.

**2.1.1 List Flashcards**

* **Method:** `GET`
* **Path:** `/api/flashcards`
* **Description:** Retrieves a list of the authenticated user's flashcards.
* **Query Parameters:**
  * `limit` (integer, optional): Number of items per page. Default: 20.
  * `offset` (integer, optional): Number of items to skip. Default: 0.
  * `sortBy` (string, optional): Field to sort by (e.g., `created_at`, `updated_at`). Default: `created_at`.
  * `order` (string, optional): Sort order (`asc` or `desc`). Default: `desc`.
* **Request Payload:** None
* **Response Payload (JSON):**

    ```json
    {
      "data": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "front_text": "string (max 200)",
          "back_text": "string (max 500)",
          "source": "'manual' | 'ai'",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
        // ... more flashcards
      ],
      "pagination": {
        "total": "integer",
        "limit": "integer",
        "offset": "integer"
      }
    }
    ```

* **Success Codes:** `200 OK`
* **Error Codes:** `401 Unauthorized`, `500 Internal Server Error`

**2.1.2 Create Manual Flashcards**

* **Method:** `POST`
* **Path:** `/api/flashcards`
* **Description:** Creates one or more new flashcards manually.
* **Request Payload (JSON):**

  ```json
  {
    "flashcards": [
    {
      "front_text": "string (max 200)",
      "back_text": "string (max 500)"
    }
    // ... more flashcard objects
    ]
  }
  ```

* **Response Payload (JSON):**

  ```json
  {
    "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "front_text": "string",
      "back_text": "string",
      "source": "manual",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    // ... more created flashcards
    ]
  }
  ```

* **Success Codes:** `201 Created`
* **Error Codes:** `400 Bad Request` (Validation errors on one or more items), `401 Unauthorized`, `500 Internal Server Error`

**2.1.3 Get Flashcard**

* **Method:** `GET`
* **Path:** `/api/flashcards/{flashcardId}`
* **Description:** Retrieves a specific flashcard by its ID.
* **Request Payload:** None
* **Response Payload (JSON):**

    ```json
    {
      "id": "uuid",
      "user_id": "uuid",
      "front_text": "string",
      "back_text": "string",
      "source": "'manual' | 'ai'",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```

* **Success Codes:** `200 OK`
* **Error Codes:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

**2.1.4 Update Flashcard**

* **Method:** `PUT`
* **Path:** `/api/flashcards/{flashcardId}`
* **Description:** Updates the text of an existing flashcard.
* **Request Payload (JSON):**

    ```json
    {
      "front_text": "string (max 200)",
      "back_text": "string (max 500)"
    }
    ```

* **Response Payload (JSON):**

    ```json
    {
      "id": "uuid",
      "user_id": "uuid",
      "front_text": "string",
      "back_text": "string",
      "source": "'manual' | 'ai'", // source remains unchanged
      "created_at": "timestamp",
      "updated_at": "timestamp" // updated
    }
    ```

* **Success Codes:** `200 OK`
* **Error Codes:** `400 Bad Request` (Validation errors), `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

**2.1.5 Delete Flashcard**

* **Method:** `DELETE`
* **Path:** `/api/flashcards/{flashcardId}`
* **Description:** Deletes a specific flashcard.
* **Request Payload:** None
* **Response Payload:** None
* **Success Codes:** `204 No Content`
* **Error Codes:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

---

### 2.2 AI Candidates (`/ai-candidates`)

Manages AI-generated flashcard suggestions pending review.

**2.2.1 List AI Candidates**

* **Method:** `GET`
* **Path:** `/api/ai-candidates`
* **Description:** Retrieves a list of pending AI candidates for the user.
* **Query Parameters:** (Same as List Flashcards: `limit`, `offset`, `sortBy`, `order`)
* **Request Payload:** None
* **Response Payload (JSON):**

    ```json
    {
      "data": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "front_text": "string (max 200)",
          "back_text": "string (max 500)",
          "source_text_hash": "string",
          "created_at": "timestamp",
          "updated_at": "null"
        }
        // ... more candidates
      ],
      "pagination": {
        "total": "integer",
        "limit": "integer",
        "offset": "integer"
      }
    }
    ```

* **Success Codes:** `200 OK`
* **Error Codes:** `401 Unauthorized`, `500 Internal Server Error`

**2.2.2 Update AI Candidate**

* **Method:** `PUT`
* **Path:** `/api/ai-candidates/{candidateId}`
* **Description:** Updates the text of a pending AI candidate before acceptance/rejection.
* **Request Payload (JSON):**

    ```json
    {
      "front_text": "string (max 200)",
      "back_text": "string (max 500)"
    }
    ```

* **Response Payload (JSON):**

    ```json
    {
      "id": "uuid",
      "user_id": "uuid",
      "front_text": "string",
      "back_text": "string",
      "source_text_hash": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp" // updated
    }
    ```

* **Success Codes:** `200 OK`
* **Error Codes:** `400 Bad Request` (Validation errors), `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

**2.2.3 Reject (Delete) AI Candidate**

* **Method:** `DELETE`
* **Path:** `/api/ai-candidates/{candidateId}`
* **Description:** Rejects and deletes a pending AI candidate. Logs a 'rejected' event.
* **Request Payload:** None
* **Response Payload:** None
* **Success Codes:** `204 No Content`
* **Error Codes:** `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

**2.2.4 Accept AI Candidate**

* **Method:** `POST`
* **Path:** `/api/ai-candidates/{candidateId}/accept`
* **Description:** Accepts an AI candidate, creating a new flashcard with `source: 'ai'`, deleting the candidate, and logging an 'accepted' event. Assumes any edits were done via `PUT /api/ai-candidates/{candidateId}` first.
* **Request Payload:** None
* **Response Payload (JSON):** (The newly created flashcard)

    ```json
    {
      "id": "uuid", // ID of the new flashcard
      "user_id": "uuid",
      "front_text": "string", // from the candidate
      "back_text": "string", // from the candidate
      "source": "ai",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```

* **Success Codes:** `201 Created`
* **Error Codes:** `401 Unauthorized`, `404 Not Found` (Candidate not found), `500 Internal Server Error`

---

### 2.3 AI Generation (`/ai`)

Handles the triggering of the AI generation process.

**2.3.1 Generate Flashcard Candidates**

* **Method:** `POST`
* **Path:** `/api/ai/generate`
* **Description:** Submits source text to the AI service to generate flashcard candidates. Creates `ai_candidates` records and logs a 'generated' event. (Synchronous for MVP).
* **Request Payload (JSON):**

    ```json
    {
      "sourceText": "string" // The text to generate flashcards from
    }
    ```

* **Response Payload (JSON):** (List of created candidates)

    ```json
    {
      "data": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "front_text": "string (max 200)",
          "back_text": "string (max 500)",
          "source_text_hash": "string",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
        // ... more candidates generated
      ]
    }
    ```

* **Success Codes:** `201 Created`
* **Error Codes:**
  * `400 Bad Request` (Invalid input, AI service error)
  * `401 Unauthorized`
  * `402 Payment Required` (AI service requires payment/credits)
  * `429 Too Many Requests` (Rate limiting)
  * `500 Internal Server Error`
  * `502 Bad Gateway` (AI service unavailable or error)

---

### 2.4 Statistics (`/stats`)

Provides user-specific statistics.

**2.4.1 Get Generation Statistics**

* **Method:** `GET`
* **Path:** `/api/stats/generation`
* **Description:** Retrieves AI generation statistics for the authenticated user.
* **Request Payload:** None
* **Response Payload (JSON):**

    ```json
    {
      "totalGenerated": "integer", // Count of 'generated' events * candidate_count
      "totalAccepted": "integer"  // Count of 'accepted' events
      // Potentially add totalRejected if needed later
    }
    ```

* **Success Codes:** `200 OK`
* **Error Codes:** `401 Unauthorized`, `500 Internal Server Error`

---

### 2.5 User (`/users`)

Manages the user account itself.

**2.5.1 Delete User Account**

* **Method:** `DELETE`
* **Path:** `/api/users/me`
* **Description:** Deletes the authenticated user's account and all associated data (via DB cascade). Requires confirmation step in the UI.
* **Request Payload:** None
* **Response Payload:** None
* **Success Codes:** `204 No Content`
* **Error Codes:** `401 Unauthorized`, `500 Internal Server Error` (If Supabase deletion fails)

---

## 3. Authentication and Authorization

* **Authentication:** Handled by Supabase Auth. Clients must include a valid JWT (obtained via Supabase login/signup) in the `Authorization: Bearer <token>` header for all requests requiring authentication. Astro middleware (`src/middleware/index.ts`) will verify the token and attach user information to `context.locals`.
* **Authorization:** Primarily enforced by PostgreSQL Row-Level Security (RLS) policies defined in the database schema (`db-plan.md`). API endpoints rely on these policies to ensure users can only access or modify their own `flashcards`, `ai_candidates`, and `generation_stats`. The `user_id` for operations is derived from the authenticated user's JWT (`auth.uid()`).

## 4. Validation and Business Logic

* **Input Validation:**
  * Astro server endpoints will use `zod` schemas to validate request bodies and query parameters against expected types and constraints (e.g., string lengths, required fields).
  * `flashcards` & `ai_candidates`: `front_text` (max 200 chars), `back_text` (max 500 chars).
  * `POST /api/ai/generate`: `sourceText` must be a non-empty string (potential max length TBD).
  * Database constraints provide a secondary layer of validation.
* **Business Logic Implementation:**
  * **Manual Creation:** `POST /api/flashcards` sets `source = 'manual'`.
  * **AI Generation:** `POST /api/ai/generate` orchestrates:
        1. Calling the external AI service (via OpenRouter).
        2. Calculating `source_text_hash`.
        3. Creating `ai_candidates` records for each suggestion.
        4. Creating a `generation_stats` record with `event_type = 'generated'`, `candidate_count`, and `source_text_hash`.
  * **Candidate Acceptance:** `POST /api/ai-candidates/{id}/accept` orchestrates:
        1. Fetching the `ai_candidates` record.
        2. Creating a new `flashcards` record using candidate data and `source = 'ai'`.
        3. Deleting the `ai_candidates` record.
        4. Creating a `generation_stats` record with `event_type = 'accepted'` and `candidate_id`.
  * **Candidate Rejection:** `DELETE /api/ai-candidates/{id}` orchestrates:
        1. Deleting the `ai_candidates` record.
        2. Creating a `generation_stats` record with `event_type = 'rejected'` and `candidate_id`.
  * **Stats Aggregation:** `GET /api/stats/generation` queries the `generation_stats` table, filtering by `user_id` and aggregating counts based on `event_type`.
  * **User Deletion:** `DELETE /api/users/me` calls the appropriate Supabase admin function to delete the user, relying on `ON DELETE CASCADE` in the database for data cleanup.
* **Error Handling:** Endpoints return standard HTTP status codes (4xx for client errors, 5xx for server errors) with a JSON body describing the error where applicable (e.g., validation failures).

    ```json
    // Example Error Response (400 Bad Request)
    {
      "error": "Validation Failed",
      "details": {
        "front_text": ["String must contain at most 200 character(s)"]
      }
    }
    ```
