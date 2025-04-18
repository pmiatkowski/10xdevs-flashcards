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

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/flashcards", "/settings"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Get authenticated user data directly from the server
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get session data only for checking if a session exists
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Use authenticated user data
    locals.supabase = supabase;
    locals.session = session;
    locals.user = user;

    // Always allow public paths
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    // Redirect authenticated users away from auth pages
    if (user && ["/login", "/register", "/forgot-password", "/reset-password"].includes(url.pathname)) {
      return redirect("/");
    }

    // Redirect unauthenticated users from protected routes
    if (!user && PROTECTED_ROUTES.includes(url.pathname)) {
      return redirect("/login");
    }

    return next();
  } catch (error) {
    logger.error("Middleware error:", error);
    locals.session = null;
    locals.user = null;
    // Only redirect to login if accessing a protected route
    if (PROTECTED_ROUTES.includes(url.pathname)) {
      return redirect("/login");
    }
    return next();
  }
});
