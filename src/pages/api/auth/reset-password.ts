import type { APIRoute } from "astro";
import { resetPasswordSchema } from "@/lib/validation/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    // We only need newPassword and token for the API call
    const { token, newPassword } = resetPasswordSchema
      .pick({ newPassword: true })
      .extend({ token: z.string().min(1, "Reset token is required") })
      .parse(body);

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
      password: newPassword,
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
