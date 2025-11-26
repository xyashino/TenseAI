import type { Database } from "@/db/database.types";
import { BadRequestError, NotFoundError } from "@/server/errors/api-errors";
import type { SupabaseClient } from "@/db/supabase.client";
import { ProfileRepository } from "./profile.repository";
import type { ProfileOutput, UpdateProfileInput } from "./profile.types";

export class ProfileService {
  private repo: ProfileRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new ProfileRepository(supabase);
  }

  async getProfile(userId: string): Promise<ProfileOutput> {
    const profile = await this.repo.getProfileById(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    return profile;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileOutput> {
    try {
      const updatedProfile = await this.repo.updateProfile(userId, input);
      return updatedProfile;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError("Failed to update profile");
    }
  }
}
