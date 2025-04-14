import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize locals with default values
  context.locals.supabase = supabaseClient;
  context.locals.session = null;
  context.locals.user = null;

  // Get session from Supabase (this automatically checks cookies)
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (!error && session) {
    context.locals.session = session;
    context.locals.user = session.user;
  }

  return next();
});
