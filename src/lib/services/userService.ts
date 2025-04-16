import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

interface DeleteUserAccountResult {
  error: Error | null;
}

/**
 * Deletes a user account and all associated data using Supabase admin client
 * @param userId - The ID of the user to delete
 * @returns A promise that resolves to an object containing any error that occurred
 * @throws Error if environment variables are missing or invalid
 */
export async function deleteUserAccount(userId: string): Promise<DeleteUserAccountResult> {
  const env = {
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error("Invalid or missing environment variables for Supabase admin operations");
  }

  try {
    const supabaseAdmin = createClient(result.data.SUPABASE_URL, result.data.SUPABASE_SERVICE_ROLE_KEY);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to delete user account") };
  }
}
