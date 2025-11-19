import { ProfileService } from "@/server/modules/profile";
import { successResponse } from "@/server/utils/api-response";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { updateProfileApiSchema } from "@/shared/schema/profile";
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

    const validatedData = updateProfileApiSchema.parse(await request.json());

    const profileService = new ProfileService(supabase);
    const updatedProfile = await profileService.updateProfile(userId, {
      ...validatedData,
      onboarding_completed: true,
    });

    return successResponse(updatedProfile);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
