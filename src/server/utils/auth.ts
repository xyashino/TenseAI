import type { Database } from "@/db/database.types";
import { UnauthorizedError } from "@/server/errors/api-errors";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function authenticateUser(supabase: SupabaseClient<Database>): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError(error?.message || "Authentication required");
  }

  return user.id;
}
