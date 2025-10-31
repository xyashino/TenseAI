import { createSupabaseServerClient } from "@/db/supabase.client";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/auth/confirm"];

export const onRequest = defineMiddleware(async (context, next) => {
  if (PUBLIC_PATHS.includes(context.url.pathname) || context.url.pathname.startsWith("/api/auth/")) {
    return next();
  }

  const supabase = createSupabaseServerClient({ headers: context.request.headers, cookies: context.cookies });
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return context.redirect("/login");
  }

  context.locals.session = data.session;
  context.locals.user = data.session.user;
  context.locals.supabase = supabase;

  return next();
});
