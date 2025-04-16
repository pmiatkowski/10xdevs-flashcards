import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

interface DeleteUserAccountResult {
  error: Error | null;
}

/**
 * Deletes the current user's account and all associated data using their own authenticated session
 * @param supabase - The authenticated Supabase client
 * @returns A promise that resolves to an object containing any error that occurred
 */
export async function deleteUserAccount(supabase: SupabaseClient<Database>): Promise<DeleteUserAccountResult> {
  try {
    // First delete all user data using our database function
    const { error: deleteError } = await supabase.rpc("delete_user_data");
    if (deleteError) throw deleteError;

    // Then sign out the user
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to delete user account") };
  }
}
