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

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/api/auth/")) {
    return next();
  }

  const supabase = createSupabaseServerClient({ headers: context.request.headers, cookies: context.cookies });
  const { data } = await supabase.auth.getSession();
  const isAuthenticated = !!data.session;
  const isAuthPath = AUTH_PATHS.includes(context.url.pathname as (typeof AUTH_PATHS)[number]);
  const isPublicPath = PUBLIC_PATHS.includes(context.url.pathname as (typeof PUBLIC_PATHS)[number]);

  if (isAuthenticated && isAuthPath) {
    return context.redirect(NavigationRoutes.THEORY, 302);
  }

  if (isPublicPath || isAuthPath) {
    return next();
  }

  if (!isAuthenticated) {
    return context.redirect("/login", 302);
  }

  context.locals.session = data.session;
  context.locals.user = data.session.user;
  context.locals.supabase = supabase;

  return next();
});
