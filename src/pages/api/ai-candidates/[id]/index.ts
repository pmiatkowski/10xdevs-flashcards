import type { APIContext } from "astro";
import { z } from "zod";
import type { AICandidateDTO, ApiErrorResponseDto } from "../../../../types";

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
  // 1. Check authentication
  const session = locals.session;
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

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
    const supabase = locals.supabase;

    // 4. Validate request body
    const body = await request.json();
    const validationResult = UpdateAICandidateCommandSchema.safeParse(body);
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Invalid input",
        // errors: Object.entries(validationResult.error.flatten().fieldErrors).map(([key, value]) => ({
        //   field: key,
        //   messages: value,
        // })),
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Check if the candidate exists and belongs to the current user
    const { data: existing, error: fetchError } = await supabase
      .from("ai_candidates")
      .select()
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existing) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Candidate not found or you don't have permission to update it",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Update the candidate
    const { data: updated, error: updateError } = await supabase
      .from("ai_candidates")
      .update({ ...validationResult.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating candidate:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify(updated as AICandidateDTO), {
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
  // 1. Check authentication
  const session = locals.session;
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

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
    const supabase = locals.supabase;

    // 4. Check if the candidate exists and belongs to the current user
    const { data: existing, error: fetchError } = await supabase
      .from("ai_candidates")
      .select()
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existing) {
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
      .eq("user_id", session.user.id);

    if (deleteError) {
      console.error("Error deleting candidate:", deleteError);
      throw deleteError;
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
