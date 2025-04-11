# PostgreSQL Database Schema for Fiszki AI

## 1. Tables

### `flashcards`

Stores manually created or AI-generated and accepted flashcards.

| Column Name | Data Type        | Constraints                                      | Description                                      |
| :---------- | :--------------- | :----------------------------------------------- | :----------------------------------------------- |
| `id`        | `UUID`           | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`       | Unique identifier for the flashcard.             |
| `user_id`   | `UUID`           | `NOT NULL`, `REFERENCES auth.users ON DELETE CASCADE` | Foreign key linking to the user who owns the flashcard. |
| `front_text`| `VARCHAR(200)`   | `NOT NULL`, `CHECK (length(front_text) <= 200)` | Text content for the front of the flashcard.     |
| `back_text` | `VARCHAR(500)`   | `NOT NULL`, `CHECK (length(back_text) <= 500)`  | Text content for the back of the flashcard.      |
| `source`    | `TEXT`           | `NOT NULL`                                       | Origin of the flashcard ('manual' or 'ai').      |
| `created_at`| `TIMESTAMPTZ`    | `DEFAULT NOW()`                                  | Timestamp when the flashcard was created.        |
| `updated_at`| `TIMESTAMPTZ`    | `DEFAULT NOW()`                                  | Timestamp when the flashcard was last updated.   |

### `ai_candidates`

Stores AI-generated flashcard candidates pending user review.

| Column Name       | Data Type        | Constraints                                      | Description                                         |
| :---------------- | :--------------- | :----------------------------------------------- | :-------------------------------------------------- |
| `id`              | `UUID`           | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`       | Unique identifier for the AI candidate.             |
| `user_id`         | `UUID`           | `NOT NULL`, `REFERENCES auth.users ON DELETE CASCADE` | Foreign key linking to the user who generated the candidate. |
| `front_text`      | `VARCHAR(200)`   | `NOT NULL`, `CHECK (length(front_text) <= 200)` | Proposed text content for the front.                |
| `back_text`       | `VARCHAR(500)`   | `NOT NULL`, `CHECK (length(back_text) <= 500)`  | Proposed text content for the back.                 |
| `source_text_hash`| `TEXT`           | `NOT NULL`                                       | Hash of the source text used for generation.        |
| `created_at`      | `TIMESTAMPTZ`    | `DEFAULT NOW()`                                  | Timestamp when the candidate was generated.         |
| `updated_at`      | `TIMESTAMPTZ`    | `DEFAULT NOW()`                                  | Timestamp when the candidate was last updated.      |

### `generation_stats`

Logs events related to AI flashcard generation.

| Column Name       | Data Type     | Constraints                                      | Description                                                                 |
| :---------------- | :------------ | :----------------------------------------------- | :-------------------------------------------------------------------------- |
| `id`              | `UUID`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`       | Unique identifier for the log entry.                                        |
| `user_id`         | `UUID`        | `NOT NULL`, `REFERENCES auth.users ON DELETE CASCADE` | Foreign key linking to the user associated with the event.                  |
| `event_type`      | `TEXT`        | `NOT NULL`                                       | Type of event ('generated', 'accepted', 'rejected').                        |
| `timestamp`       | `TIMESTAMPTZ` | `DEFAULT NOW()`                                  | Timestamp when the event occurred.                                          |
| `candidate_id`    | `UUID`        | `REFERENCES ai_candidates(id) ON DELETE SET NULL`| Foreign key linking to the specific candidate (for 'accepted'/'rejected'). |
| `candidate_count` | `INTEGER`     |                                                  | Number of candidates generated in a 'generated' event.                      |
| `source_text_hash`| `TEXT`        |                                                  | Hash of the source text used (primarily for 'generated' events).            |

## 2. Relationships

* **`auth.users` 1 : N `flashcards`**: One user can own multiple flashcards. `ON DELETE CASCADE` ensures flashcards are deleted when the user is deleted.
* **`auth.users` 1 : N `ai_candidates`**: One user can generate multiple AI candidates. `ON DELETE CASCADE` ensures candidates are deleted when the user is deleted.
* **`auth.users` 1 : N `generation_stats`**: One user can have multiple generation log entries. `ON DELETE CASCADE` ensures logs are deleted when the user is deleted.
* **`ai_candidates` 1 : N `generation_stats`**: One AI candidate can be associated with 'accepted' or 'rejected' events in the stats log. `ON DELETE SET NULL` ensures that if a candidate is deleted (e.g., rejected), the log entry remains but the link is nullified.

## 3. Indexes

* `flashcards`: Index on `user_id`.
* `ai_candidates`: Index on `user_id`.
* `ai_candidates`: Index on `source_text_hash` (Non-unique, for potential lookups).
* `generation_stats`: Index on `user_id`.
* `generation_stats`: Index on `candidate_id`.
* `generation_stats`: Index on `timestamp`.

```sql
-- Example Index Creation Statements
CREATE INDEX idx_flashcards_user_id ON flashcards (user_id);
CREATE INDEX idx_ai_candidates_user_id ON ai_candidates (user_id);
CREATE INDEX idx_ai_candidates_source_text_hash ON ai_candidates (source_text_hash);
CREATE INDEX idx_generation_stats_user_id ON generation_stats (user_id);
CREATE INDEX idx_generation_stats_candidate_id ON generation_stats (candidate_id);
CREATE INDEX idx_generation_stats_timestamp ON generation_stats (timestamp);
```

## 4. Row-Level Security (RLS) Policies

RLS should be enabled for all tables (`flashcards`, `ai_candidates`, `generation_stats`).

```sql
-- Enable RLS
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own flashcards
CREATE POLICY "Allow users to manage their own flashcards"
ON flashcards
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can manage their own AI candidates
CREATE POLICY "Allow users to manage their own AI candidates"
ON ai_candidates
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own generation stats
CREATE POLICY "Allow users to view their own generation stats"
ON generation_stats
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow internal operations (like logging) to insert stats (adjust based on specific needs, e.g., using service roles)
-- This policy might need refinement depending on how stats are inserted (e.g., via triggers, functions, or service roles).
-- A simple permissive insert for authenticated users might look like this, but consider security implications.
CREATE POLICY "Allow authenticated users to insert their own stats"
ON generation_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Note: Deletion is handled by ON DELETE CASCADE and user account deletion. Specific DELETE policies might be needed if users can delete individual stats entries directly.
```

## 5. Additional Notes

* **UUID Generation:** Assumes the `pgcrypto` extension is enabled for `gen_random_uuid()`. Supabase typically provides this.
* **`updated_at` Trigger:** A trigger function should be created to automatically update the `updated_at` column on any row update for `flashcards` and `ai_candidates`.

    ```sql
    -- Example Trigger Function
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Example Trigger Application
    CREATE TRIGGER set_timestamp_flashcards
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

    CREATE TRIGGER set_timestamp_ai_candidates
    BEFORE UPDATE ON ai_candidates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
    ```

* **`source_text_hash` Uniqueness:** The requirement for global uniqueness on `source_text_hash` in `ai_candidates` was removed based on unresolved issues, as it could prevent different users from processing the same text and poses collision risks. An index is added instead for potential lookups.
* **ENUM Types:** `TEXT` was chosen over `ENUM` for `flashcards.source` and `generation_stats.event_type` for flexibility during development, as per the planning session summary. This can be revisited if stricter type control is desired later.
* **Primary Keys:** `UUID` is used for primary keys in all custom tables for consistency and to avoid exposing sequential IDs.
* **Spaced Repetition:** No fields related to the spaced repetition algorithm state are included in `flashcards` as per the MVP decision. This will be handled externally.
