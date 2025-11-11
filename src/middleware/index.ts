import { createSupabaseServerClient } from "@/db/supabase.client";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = [NavigationRoutes.HOME, NavigationRoutes.AUTH_CONFIRM];
const AUTH_PATHS = [
  NavigationRoutes.LOGIN,
  NavigationRoutes.REGISTER,
  NavigationRoutes.FORGOT_PASSWORD,
  NavigationRoutes.RESET_PASSWORD,
];
const ONBOARDING_PATH = "/onboarding";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient({ headers: context.request.headers, cookies: context.cookies });
  const isApiPath = context.url.pathname.startsWith("/api/");

  // For API endpoints, only set up locals without redirects
  if (isApiPath) {
    const { data: userData } = await supabase.auth.getUser();
    const { data: sessionData } = await supabase.auth.getSession();

    if (userData.user) {
      context.locals.session = sessionData.session;
      context.locals.user = userData.user;
      context.locals.supabase = supabase;
    } else {
      context.locals.supabase = supabase;
    }

    return next();
  }

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
    return context.redirect("/login", 302);
  }

  // Get session after verifying user (safe since user is authenticated)
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userData.user.id).single();
  if (profile && !profile.onboarding_completed && !isOnboardingPath) {
    return context.redirect(ONBOARDING_PATH, 302);
  }
  if (profile && profile.onboarding_completed && isOnboardingPath) {
    return context.redirect(NavigationRoutes.THEORY, 302);
  }

  context.locals.session = sessionData.session;
  context.locals.user = userData.user;
  context.locals.supabase = supabase;
  context.locals.profile = profile;

  return next();
});
