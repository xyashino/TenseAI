import type { Database } from "@/db/database.types";
import { IdentityService } from "@/server/modules/identity";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function authenticateUser(supabase: SupabaseClient<Database>): Promise<string> {
  const identityService = new IdentityService(supabase);
  const user = await identityService.getCurrentUser();
  return user.id;
}
