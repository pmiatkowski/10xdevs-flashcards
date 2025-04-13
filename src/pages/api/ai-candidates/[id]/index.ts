import type { APIContext } from "astro";
import { z } from "zod";
import { DEFAULT_USER_ID, supabaseClient } from "../../../../db/supabase.client";
import type { AICandidateDTO, ApiErrorResponseDto, UpdateAICandidateCommand } from "../../../../types";

export const prerender = false;

// Zod schema for validating the update command
const UpdateAICandidateCommandSchema = z.object({
  front_text: z
    .string()
    .min(1, { message: "Front text is required" })
    .max(200, { message: "Front text must be 200 characters or less" }),
  back_text: z
    .string()
    .min(1, { message: "Back text is required" })
    .max(500, { message: "Back text must be 500 characters or less" }),
});

export async function PUT({ params, request, locals }: APIContext): Promise<Response> {
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
    // 3. Parse and validate request body
    const body = await request.json();
    const result = UpdateAICandidateCommandSchema.safeParse(body);

    if (!result.success) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Invalid request data",
        errors: result.error.flatten().fieldErrors,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Get validated data
    const updateData: UpdateAICandidateCommand = result.data;

    // 5. Get Supabase client from context
    const supabase = locals.supabase || supabaseClient;

    // 6. Check if the candidate exists and belongs to the current user
    const { data: candidate, error: fetchError } = await supabase
      .from("ai_candidates")
      .select("*")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !candidate) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Candidate not found or you don't have permission to update it",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 7. Update the candidate
    const { data: updatedCandidate, error: updateError } = await supabase
      .from("ai_candidates")
      .update({
        front_text: updateData.front_text,
        back_text: updateData.back_text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating candidate:", updateError);
      const errorResponse: ApiErrorResponseDto = {
        message: "Failed to update candidate",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 8. Return the updated candidate
    return new Response(JSON.stringify(updatedCandidate as AICandidateDTO), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/ai-candidates/[id]:", error);
    const errorResponse: ApiErrorResponseDto = {
      message: "Internal server error",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE({ params, locals }: APIContext): Promise<Response> {
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
      .select("id")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !candidate) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Candidate not found or you don't have permission to reject it",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Delete the candidate
    const { error: deleteError } = await supabase
      .from("ai_candidates")
      .delete()
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID);

    if (deleteError) {
      console.error("Error deleting candidate:", deleteError);
      const errorResponse: ApiErrorResponseDto = {
        message: "Failed to reject candidate",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Return 204 No Content for successful deletion
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error in DELETE /api/ai-candidates/[id]:", error);
    const errorResponse: ApiErrorResponseDto = {
      message: "Internal server error",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
