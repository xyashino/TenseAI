import type { Database } from "@/db/database.types";
import { InternalServerError, NotFoundError } from "@/server/errors/api-errors";
import type { Profile, ProfileUpdate } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class ProfileService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase.from("profiles").select("*").eq("user_id", userId).single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Profile not found");
      }
      throw new InternalServerError(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Profile not found");
      }
      throw new InternalServerError(`Failed to update profile: ${error.message}`);
    }

    return data;
  }
}
