import { ProfileService } from "@/server/services/profile.service";
import { successResponse } from "@/server/utils/api-response";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { updateProfileSchema } from "@/server/validation/profile.validation";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const supabase = locals.supabase;
    const userId = await authenticateUser(supabase);

    const profileService = new ProfileService(supabase);
    const profile = await profileService.getProfile(userId);

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

    const profileService = new ProfileService(supabase);
    const updatedProfile = await profileService.updateProfile(userId, validatedData);

    return successResponse(updatedProfile);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
