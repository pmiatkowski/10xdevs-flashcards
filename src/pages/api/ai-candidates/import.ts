import type { APIContext } from "astro";
import { z } from "zod";
import type { AICandidateDTO, ApiErrorResponseDto, ImportGuestCandidatesCommand } from "../../../types";

export const prerender = false;

// Zod schema for validating the import command
const ImportGuestCandidatesSchema = z.object({
  candidates: z
    .array(
      z.object({
        front_text: z
          .string()
          .min(1, { message: "Front text is required" })
          .max(200, { message: "Front text must be 200 characters or less" }),
        back_text: z
          .string()
          .min(1, { message: "Back text is required" })
          .max(500, { message: "Back text must be 500 characters or less" }),
        source_text_hash: z.string().min(1, { message: "Source text hash is required" }),
      })
    )
    .min(1, { message: "At least one candidate is required" }),
});

export async function POST({ request, locals }: APIContext): Promise<Response> {
  // 1. Check authentication
  const session = locals.session;
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // 2. Get Supabase client from context
    const supabase = locals.supabase;

    // 3. Validate request body
    const body = await request.json();
    const validationResult = ImportGuestCandidatesSchema.safeParse(body);
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponseDto = {
        message: "Invalid input",
        details: validationResult.error.flatten().fieldErrors,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { candidates } = validationResult.data as ImportGuestCandidatesCommand;

    // 4. Prepare candidates for insertion with authenticated user ID
    const candidatesForInsertion = candidates.map((candidate) => ({
      front_text: candidate.front_text,
      back_text: candidate.back_text,
      source_text_hash: candidate.source_text_hash,
      user_id: session.user.id,
    }));

    // 5. Insert candidates into database
    const { data: insertedCandidates, error: insertError } = await supabase
      .from("ai_candidates")
      .insert(candidatesForInsertion)
      .select();

    if (insertError) {
      console.error("Error importing candidates:", insertError);
      const errorResponse: ApiErrorResponseDto = {
        message: "Failed to import candidates",
        details: insertError,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Record generation statistics
    const sourceTextHashes = [...new Set(candidates.map((c) => c.source_text_hash))];

    // Create statistics entries for each unique source text hash
    for (const hash of sourceTextHashes) {
      const candidatesForHash = candidates.filter((c) => c.source_text_hash === hash);

      const { error: statsError } = await supabase.from("generation_stats").insert({
        user_id: session.user.id,
        event_type: "imported",
        candidate_count: candidatesForHash.length,
        source_text_hash: hash,
      });

      if (statsError) {
        // Log but don't fail the whole request
        console.error("Error recording generation stats:", statsError);
      }
    }

    // 7. Return the imported candidates
    return new Response(JSON.stringify(insertedCandidates as AICandidateDTO[]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/ai-candidates/import:", error);
    const errorResponse: ApiErrorResponseDto = {
      message: "Internal server error",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
