import type { APIRoute } from "astro";
import { z } from "zod";
import { formatError } from "@/lib/errors/apiErrors";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(["created_at", "updated_at"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const createFlashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      front_text: z.string().min(1).max(200),
      back_text: z.string().min(1).max(500),
    })
  ),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Sprawdź, czy użytkownik jest zalogowany
    const session = locals.session;
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // Parsuj i waliduj parametry zapytania
    const params = Object.fromEntries(url.searchParams.entries());
    const { limit, offset, sortBy, order } = querySchema.parse(params);

    // Pobierz dane z Supabase
    const { data, error, count } = await locals.supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id)
      .order(sortBy, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        data,
        total: count,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return formatError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź, czy użytkownik jest zalogowany
    const session = locals.session;
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // Parsuj i waliduj dane wejściowe
    const body = await request.json();
    const { flashcards } = createFlashcardsSchema.parse(body);

    // Zapisz do bazy danych
    const { data, error } = await locals.supabase
      .from("flashcards")
      .insert(
        flashcards.map((flashcard) => ({
          ...flashcard,
          user_id: session.user.id,
          source: "manual",
        }))
      )
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return formatError(error);
  }
};
