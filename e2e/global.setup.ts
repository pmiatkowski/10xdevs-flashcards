import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

setup("validate database connection and authenticate", async () => {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_KEY ||
    !process.env.E2E_USERNAME ||
    !process.env.E2E_PASSWORD
  ) {
    throw new Error("Missing required environment variables for database setup");
  }

  const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Sign in with test user credentials
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME,
    password: process.env.E2E_PASSWORD,
  });

  if (signInError) {
    console.error("Error signing in:", signInError);
    throw signInError;
  }

  // Verify connection and permissions
  const { error } = await supabase.from("flashcards").select("count");
  if (error) {
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
});
