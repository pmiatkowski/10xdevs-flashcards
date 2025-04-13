import type { APIContext } from "astro";
import { DEFAULT_USER_ID, supabaseClient } from "../../../../../db/supabase.client";
import type { ApiErrorResponseDto, FlashcardDTO } from "../../../../../types";

export const prerender = false;

export async function POST({ params, locals }: APIContext): Promise<Response> {
  // 2. Validate ID parameter
  const { id } = params;
  if (!id) {
    const errorResponse: ApiErrorResponseDto = {
      message: "Missing candidate ID",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 3. Get Supabase client from context
    const supabase = locals.supabase || supabaseClient;

    // 4. Check if the candidate exists and belongs to the current user
    const { data: candidate, error: fetchError } = await supabase
      .from("ai_candidates")
      .select("*")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !candidate) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Candidate not found or you don't have permission to accept it",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Create a new flashcard from the candidate
    const { data: flashcard, error: insertError } = await supabase
      .from("flashcards")
      .insert({
        user_id: DEFAULT_USER_ID,
        front_text: candidate.front_text,
        back_text: candidate.back_text,
        source: candidate.created_at !== candidate.updated_at ? "ai-edited" : "ai",
        source_text_hash: candidate.source_text_hash,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating flashcard:", insertError);
      const errorResponse: ApiErrorResponseDto = {
        message: "Failed to create flashcard from candidate",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Update generation stats with 'accepted' event
    const { error: statsError } = await supabase.from("generation_stats").insert({
      user_id: DEFAULT_USER_ID,
      event_type: "accepted",
      candidate_count: 1,
      source_text_hash: candidate.source_text_hash,
    });

    if (statsError) {
      // Log error but continue, as this is not critical for the user flow
      console.error("Error updating generation stats:", statsError);
    }

    // 7. Delete the candidate (now that it has been accepted)
    const { error: deleteError } = await supabase
      .from("ai_candidates")
      .delete()
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID);

    if (deleteError) {
      console.error("Error deleting accepted candidate:", deleteError);
      // Don't return an error here since we already created the flashcard
      // This will be handled by cleanup processes or the user can still reject it later
    }

    // 8. Return the created flashcard
    return new Response(JSON.stringify(flashcard as FlashcardDTO), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/ai-candidates/[id]/accept:", error);
    const errorResponse: ApiErrorResponseDto = {
      message: "Internal server error",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
