import type { APIRoute } from "astro";
import { z } from "zod";
import { formatError } from "@/lib/errors/apiErrors";

const updateFlashcardSchema = z.object({
  front_text: z.string().min(1).max(200),
  back_text: z.string().min(1).max(500),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const session = locals.session;
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Missing flashcard ID" }), {
        status: 400,
      });
    }

    const body = await request.json();
    const validatedData = updateFlashcardSchema.parse(body);

    // Sprawdź, czy fiszka należy do użytkownika
    const { data: existing, error: fetchError } = await locals.supabase
      .from("flashcards")
      .select()
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existing) {
      return new Response(JSON.stringify({ message: "Flashcard not found" }), {
        status: 404,
      });
    }

    // Zaktualizuj fiszkę
    const { data, error } = await locals.supabase
      .from("flashcards")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return formatError(error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const session = locals.session;
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Missing flashcard ID" }), {
        status: 400,
      });
    }

    // Sprawdź, czy fiszka należy do użytkownika
    const { data: existing, error: fetchError } = await locals.supabase
      .from("flashcards")
      .select()
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existing) {
      return new Response(JSON.stringify({ message: "Flashcard not found" }), {
        status: 404,
      });
    }

    // Usuń fiszkę
    const { error } = await locals.supabase.from("flashcards").delete().eq("id", id).eq("user_id", session.user.id);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("API error:", error);
    return formatError(error);
  }
};
