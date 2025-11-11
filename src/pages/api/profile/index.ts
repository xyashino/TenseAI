import { ProfileRepository } from "@/server/repositories/profile.repository";
import { successResponse } from "@/server/utils/api-response";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { updateProfileSchema } from "@/server/validation/profile.validation";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const supabase = locals.supabase;
    const userId = await authenticateUser(supabase);

    const profileRepository = new ProfileRepository(supabase);
    const profile = await profileRepository.getProfileById(userId);

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const userId = await authenticateUser(supabase);

    const validatedData = updateProfileSchema.parse(await request.json());

    const profileRepository = new ProfileRepository(supabase);
    const updatedProfile = await profileRepository.updateProfile(userId, {
      ...validatedData,
      onboarding_completed: true,
    });

    return successResponse(updatedProfile);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
