import { requireEnv, getEnv } from "@/server/utils/env";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

const supabaseUrl = requireEnv("SUPABASE_URL");
const supabaseKey = requireEnv("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

export type SupabaseClient = typeof supabaseClient;

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name: name || "", value: rest.join("=") || "" };
  });
}

function getCookieOptions(headers: Headers): CookieOptionsWithName {
  const forwardedProto = headers.get("x-forwarded-proto");
  const isSecureFromHeader = forwardedProto === "https";

  const siteUrl = getEnv("PUBLIC_SITE_URL") || "";
  const isSecureFromUrl = siteUrl.startsWith("https://");

  const isSecure = isSecureFromHeader || isSecureFromUrl;

  return {
    path: "/",
    secure: isSecure,
    httpOnly: true,
    sameSite: "lax" as const,
  };
}

export const createSupabaseServerClient = (context: { headers: Headers; cookies: AstroCookies }) => {
  const cookieOptions = getCookieOptions(context.headers);

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        const cookieHeader = context.headers.get("cookie") || "";
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const mergedOptions = {
            ...cookieOptions,
            ...options,
          };
          context.cookies.set(name, value, mergedOptions);
        });
      },
    },
    cookieOptions,
  });

  return supabase;
};
