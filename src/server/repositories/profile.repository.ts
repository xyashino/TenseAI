import type { Database } from "@/db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export class ProfileRepository {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async getProfileById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase.from("profiles").select("*").eq("user_id", userId).single();
    if (error) {
      throw new Error("Failed to fetch profile");
    }
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update profile");
    }
    return data;
  }
}
