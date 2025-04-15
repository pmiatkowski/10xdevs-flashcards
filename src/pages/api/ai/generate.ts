import type { APIContext } from "astro";
import { z } from "zod";
import type { GenerateFlashcardCandidatesCommand } from "../../../types";
import { OpenRouterService } from "../../../lib/services/openRouterService";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

const GenerateCommandSchema = z.object({
  sourceText: z.string().min(1, "Source text is required").max(10000, "Source text must be 10000 characters or less"),
});

export async function POST({ request, locals }: APIContext): Promise<Response> {
  // 1. Get supabase client from context
  const supabase =
    locals.supabase || createSupabaseServerInstance({ headers: request.headers, cookies: locals.cookies });

  // 2. Check authentication
  const session = locals.session;
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  // 3. Initialize OpenRouter service
  const openRouterService = new OpenRouterService();

  // 4. Validate input data
  let command: GenerateFlashcardCandidatesCommand;
  try {
    const body = await request.json();
    const validationResult = GenerateCommandSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          message: "Invalid input",
          validationErrors: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    command = validationResult.data;
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 5. Generate candidates
    const candidates = await openRouterService.generateCandidates(command.sourceText, session.user.id, supabase);
    console.warn("Generated candidates:", candidates);
    // 6. Return the generated candidates
    return new Response(JSON.stringify(candidates), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating candidates:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
