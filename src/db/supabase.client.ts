import { getEnv, requireEnv } from "@/server/utils/env";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
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

export const createSupabaseServerClient = (context: { request: Request; cookies: AstroCookies }) => {
  const cookieHeader = context.request.headers.get("Cookie") || "";

  const forwardedProto = context.request.headers.get("x-forwarded-proto");
  const isSecureFromHeader = forwardedProto === "https";
  const siteUrl = getEnv("PUBLIC_SITE_URL") || "";
  const isSecureFromUrl = siteUrl.startsWith("https://");
  const isSecure = isSecureFromHeader || isSecureFromUrl;

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        const cookies = parseCookieHeader(cookieHeader);
        return cookies.map(({ name, value }) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = {
            ...options,
            path: "/",
            secure: isSecure,
            httpOnly: true,
            sameSite: "lax" as const,
          };

          context.cookies.set(name, value, cookieOptions);
        });
      },
    },
  });
};
