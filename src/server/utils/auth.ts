import type { Database } from "@/db/database.types";
import { UnauthorizedError } from "@/server/errors/api-errors";
import { IdentityService } from "@/server/modules/identity";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Utility function to authenticate and get the current user ID.
 * This is a convenience wrapper around IdentityService.getCurrentUser().
 */
export async function authenticateUser(supabase: SupabaseClient<Database>): Promise<string> {
  const identityService = new IdentityService(supabase);
  const user = await identityService.getCurrentUser();
  return user.id;
}
