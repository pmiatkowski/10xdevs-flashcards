import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";
import { logger } from "../lib/utils";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  // AI generation endpoint (US-014)
  "/api/ai/generate",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    locals.supabase = supabase;
    locals.session = session;
    locals.user = user;

    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    if (!session) {
      return redirect("/login");
    }

    if (session && ["/login", "/register", "/forgot-password", "/reset-password"].includes(url.pathname)) {
      return redirect("/");
    }

    return next();
  } catch (error) {
    logger.error("Middleware error:", error);
    locals.session = null;
    locals.user = null;
    return redirect("/login");
  }
});
