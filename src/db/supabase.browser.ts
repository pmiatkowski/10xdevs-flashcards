import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
};
