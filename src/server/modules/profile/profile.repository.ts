import type { Database } from "@/db/database.types";
import type { Profile } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UpdateProfileInput } from "./profile.types";

export class ProfileRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getProfileById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase.from("profiles").select("*").eq("user_id", userId).single();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  async updateProfile(userId: string, updates: UpdateProfileInput): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }
}
