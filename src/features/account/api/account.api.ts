import { apiGet, apiPatch } from "@/lib/api-client";
import type { ProfileDTO, UpdateProfileDTO } from "@/types";

export interface GetProfileResponse {
  data: ProfileDTO;
}

export interface UpdateProfileResponse {
  data: ProfileDTO;
}

export const accountApi = {
  async getProfile(): Promise<ProfileDTO> {
    return apiGet<ProfileDTO>("/api/profile");
  },

  async updateProfile(data: UpdateProfileDTO): Promise<ProfileDTO> {
    return apiPatch<ProfileDTO>("/api/profile", data);
  },
};
