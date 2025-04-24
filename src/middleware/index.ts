import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";
import { logger } from "../lib/utils";
import { isFeatureEnabled } from "../lib/featureFlags";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/",
  "/login",
  "/register",
  // "/forgot-password", - We'll check this with feature flag
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

// Protected routes that require authentication and their corresponding feature flags
const PROTECTED_ROUTES = {
  "/flashcards": null, // null means no feature flag required
  "/settings": "settings", // requires "settings" feature flag
} as const;

// Feature-flagged public routes
const FEATURE_FLAGGED_PUBLIC_ROUTES = {
  "/forgot-password": "forgot-password",
} as const;

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

    // Check feature-flagged public routes
    const publicFeatureFlag = FEATURE_FLAGGED_PUBLIC_ROUTES[url.pathname as keyof typeof FEATURE_FLAGGED_PUBLIC_ROUTES];
    if (publicFeatureFlag) {
      if (!isFeatureEnabled(publicFeatureFlag)) {
        logger.info(`Feature ${publicFeatureFlag} is disabled for route ${url.pathname}`);
        return redirect("/login");
      }
      return next();
    }

    // Always allow public paths
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    // Redirect authenticated users away from auth pages
    if (user && ["/login", "/register", "/reset-password"].includes(url.pathname)) {
      return redirect("/");
    }

    // Check if route is protected and needs feature flag
    const requiredFeatureFlag = PROTECTED_ROUTES[url.pathname as keyof typeof PROTECTED_ROUTES];

    // Redirect unauthenticated users from protected routes
    if (!user && url.pathname in PROTECTED_ROUTES) {
      return redirect("/login");
    }

    // Check feature flag if route requires it
    if (requiredFeatureFlag && !isFeatureEnabled(requiredFeatureFlag)) {
      logger.info(`Feature ${requiredFeatureFlag} is disabled for route ${url.pathname}`);
      return redirect("/");
    }

    return next();
  } catch (error) {
    logger.error("Middleware error:", error);
    locals.session = null;
    locals.user = null;
    // Only redirect to login if accessing a protected route
    if (url.pathname in PROTECTED_ROUTES) {
      return redirect("/login");
    }
    return next();
  }
});
