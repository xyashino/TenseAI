import { createSupabaseServerInstance } from "@/db/supabase.client";
import { IdentityService } from "@/server/modules/identity";
import { ProfileRepository } from "@/server/modules/profile";
import { handleApiError } from "@/server/utils/error-handler";
import { NavigationRoutes } from "@/shared/enums/navigation";
import { callbackApiSchema } from "@/shared/schema/auth";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  try {
    const code = context.url.searchParams.get("code");
    const result = callbackApiSchema.parse({ code });

    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const identityService = new IdentityService(supabase);
    await identityService.exchangeCodeForSession(result.code);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return context.redirect(NavigationRoutes.LOGIN, 302);
    }

    const profileRepository = new ProfileRepository(supabase);
    const profile = await profileRepository.getProfileById(userData.user.id);

    if (profile && !profile.onboarding_completed) {
      return context.redirect("/onboarding", 302);
    }

    return context.redirect(NavigationRoutes.THEORY, 302);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
