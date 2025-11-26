import type { Profile } from "@/types";

export interface UpdateProfileInput {
  name?: string;
  default_difficulty?: Profile["default_difficulty"];
  onboarding_completed?: boolean;
}

export type ProfileOutput = Profile;
