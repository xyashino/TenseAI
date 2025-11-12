import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/db/database.types";

function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Required: SUPABASE_URL (or PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function cleanupUserTestData(userId: string, deleteProfile = false): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("question_reports").delete().eq("user_id", userId);

  const { error: sessionsError } = await supabase.from("training_sessions").delete().eq("user_id", userId);

  if (sessionsError) {
    throw sessionsError;
  }

  if (deleteProfile) {
    const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId);

    if (profileError) {
      throw profileError;
    }
  }
}

export async function cleanupDefaultTestUser(deleteProfile = false): Promise<void> {
  const userId = process.env.E2E_USERNAME_ID;

  if (!userId) {
    return;
  }

  await cleanupUserTestData(userId, deleteProfile);
}

export async function cleanupActiveSessions(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("training_sessions").delete().eq("user_id", userId).eq("status", "active");

  if (error) {
    throw error;
  }
}

export async function getSessionCount(userId: string): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("training_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return count || 0;
}
