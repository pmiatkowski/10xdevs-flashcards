import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("clean up test data", async () => {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_KEY ||
    !process.env.E2E_USERNAME ||
    !process.env.E2E_PASSWORD ||
    !process.env.E2E_USERNAME_ID
  ) {
    throw new Error("Missing required environment variables for database cleanup");
  }

  const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Sign in first to ensure proper permissions
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME,
    password: process.env.E2E_PASSWORD,
  });

  if (signInError) {
    throw new Error(`Failed to sign in for cleanup: ${signInError.message}`);
  }

  // Delete all test flashcards
  const { error: deleteError } = await supabase.from("flashcards").delete().eq("user_id", process.env.E2E_USERNAME_ID);

  if (deleteError) {
    throw new Error(`Failed to clean up test data: ${deleteError.message}`);
  }

  // Clean up AI candidates
  const { error: aiCandidatesError } = await supabase
    .from("ai_candidates")
    .delete()
    .eq("user_id", process.env.E2E_USERNAME_ID);

  if (aiCandidatesError) {
    throw new Error(`Failed to clean up AI candidates: ${aiCandidatesError.message}`);
  }

  // Clean up generation stats
  const { error: statsError } = await supabase
    .from("generation_stats")
    .delete()
    .eq("user_id", process.env.E2E_USERNAME_ID);

  if (statsError) {
    throw new Error(`Failed to clean up generation stats: ${statsError.message}`);
  }
});
