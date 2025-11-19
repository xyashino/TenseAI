import { createSupabaseServerInstance } from "@/db/supabase.client";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { createOptionsResponse, getCorsHeaders } from "@/server/utils/cors";
import { defineMiddleware } from "astro:middleware";
import { ProfileRepository } from "../server/modules/profile";

const PUBLIC_PATHS = [NavigationRoutes.HOME, NavigationRoutes.AUTH_CONFIRM];
const AUTH_PATHS = [
  NavigationRoutes.LOGIN,
  NavigationRoutes.REGISTER,
  NavigationRoutes.FORGOT_PASSWORD,
  NavigationRoutes.RESET_PASSWORD,
];
const ONBOARDING_PATH = "/onboarding";

export const onRequest = defineMiddleware(async (context, next) => {
  const isApiPath = context.url.pathname.startsWith("/api/");
  const requestOrigin = context.request.headers.get("origin");

  if (isApiPath && context.request.method === "OPTIONS") {
    return createOptionsResponse(requestOrigin);
  }

  if (context.url.pathname.startsWith("/api/auth/")) {
    const response = await next();
    if (isApiPath) {
      const corsHeaders = getCorsHeaders(requestOrigin);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    return response;
  }

  const supabase = createSupabaseServerInstance({ headers: context.request.headers, cookies: context.cookies });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const isAuthenticated = !!userData.user && !userError;
  const isAuthPath = AUTH_PATHS.includes(context.url.pathname as (typeof AUTH_PATHS)[number]);
  const isPublicPath = PUBLIC_PATHS.includes(context.url.pathname as (typeof PUBLIC_PATHS)[number]);
  const isOnboardingPath = context.url.pathname === ONBOARDING_PATH;

  if (isPublicPath) {
    return next();
  }

  if (isAuthPath) {
    if (isAuthenticated) {
      return context.redirect(NavigationRoutes.THEORY, 302);
    }
    return next();
  }

  if (!isAuthenticated || !userData.user) {
    if (isApiPath) {
      context.locals.user = null;
      context.locals.supabase = supabase;
      context.locals.profile = null;
      return next();
    }
    return context.redirect("/login", 302);
  }

  const profileRepository = new ProfileRepository(supabase);
  const profile = await profileRepository.getProfileById(userData.user.id);

  if (!isApiPath) {
    if (profile && !profile.onboarding_completed && !isOnboardingPath) {
      return context.redirect(ONBOARDING_PATH, 302);
    }
    if (profile && profile.onboarding_completed && isOnboardingPath) {
      return context.redirect(NavigationRoutes.THEORY, 302);
    }
  }

  context.locals.user = userData.user;
  context.locals.supabase = supabase;
  context.locals.profile = profile;

  const response = await next();

  if (isApiPath) {
    const corsHeaders = getCorsHeaders(requestOrigin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
});
