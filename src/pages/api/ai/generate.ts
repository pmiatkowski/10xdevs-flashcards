import type { APIContext } from "astro";
import { z } from "zod";
import type { GenerateFlashcardCandidatesCommand } from "../../../types";
import { OpenRouterService } from "../../../lib/services/openRouterService";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { randomUUID } from "crypto";

export const prerender = false;

const GenerateCommandSchema = z.object({
  sourceText: z.string().min(1, "Source text is required").max(10000, "Source text must be 10000 characters or less"),
});

export async function POST({ request, locals }: APIContext): Promise<Response> {
  // 1. Get supabase client from context
  const supabase =
    locals.supabase || createSupabaseServerInstance({ headers: request.headers, cookies: locals.cookies });

  // 2. Check authentication status (but allow guests)
  const session = locals.session;
  const isGuest = !session?.user?.id;
  // For guests, we generate candidates without saving them in the database
  // For authenticated users, we use their real user ID
  const userId = session?.user?.id || "guest"; // Using 'guest' as marker, not actual DB ID

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
    // For guests, we'll generate in-memory candidates
    if (isGuest) {
      // For guests, we'll call AI service but handle the results differently
      const sourceTextHash = await openRouterService.calculateHash(command.sourceText);
      const aiCandidates = await openRouterService.generateAICandidatesOnly(command.sourceText);

      // Create temporary candidates with random UUIDs that will be stored in client session storage
      const tempCandidates = aiCandidates.map((candidate) => ({
        id: randomUUID(),
        front_text: candidate.front_text,
        back_text: candidate.back_text,
        user_id: "guest",
        source_text_hash: sourceTextHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Return the temporary candidates for client-side storage
      return new Response(JSON.stringify(tempCandidates), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // For authenticated users, use the regular flow that saves to database
      const candidates = await openRouterService.generateCandidates(command.sourceText, userId, supabase);

      // Return the generated and saved candidates
      return new Response(JSON.stringify(candidates), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
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
