import type { APIContext } from "astro";
import { deleteUserAccount } from "../../../lib/services/userService";
import { logServerError } from "../../../lib/utils/errorLogger";
import type { ApiErrorResponseDto } from "../../../types";

export const prerender = false;

export async function DELETE(context: APIContext): Promise<Response> {
  if (!context.locals.session?.user?.id) {
    logServerError({
      message: "Unauthorized attempt to delete account",
      context: { path: "/api/users/me", method: "DELETE" },
    });

    const error: ApiErrorResponseDto = { message: "Unauthorized" };
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = context.locals.session.user.id;
  const result = await deleteUserAccount(userId);

  if (result.error) {
    logServerError({
      message: "Failed to delete user account",
      error: result.error,
      userId,
      context: { path: "/api/users/me", method: "DELETE" },
    });

    const error: ApiErrorResponseDto = {
      message: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? result.error.message : undefined,
    };
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 204 });
}
