import type { APIRoute } from "astro";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(4, "Password must be at least 4 characters"),
  token: z.string().min(1, "Reset token is required"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { password, token } = resetPasswordSchema.parse(body);

    const { error } = await locals.supabase.auth.exchangeCodeForSession(token);

    if (error) {
      return new Response(
        JSON.stringify({
          message: "Invalid or expired reset token",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { error: updateError } = await locals.supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      return new Response(
        JSON.stringify({
          message: updateError.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: err.errors[0].message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
