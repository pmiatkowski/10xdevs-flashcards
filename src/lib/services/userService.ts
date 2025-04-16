import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

interface DeleteUserAccountResult {
  error: Error | null;
}

/**
 * Deletes the current user's account and all associated data using admin privileges
 * @param userId - The ID of the user to delete
 * @returns A promise that resolves to an object containing any error that occurred
 */
export async function deleteUserAccount(userId: string): Promise<DeleteUserAccountResult> {
  try {
    if (!import.meta.env.SUPABASE_URL) {
      throw new Error("SUPABASE_URL environment variable is not configured");
    }
    if (!import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not configured");
    }

    const supabaseAdmin = createClient<Database>(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // First delete the user using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to delete user account") };
  }
}
