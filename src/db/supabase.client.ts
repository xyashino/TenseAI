import { requireEnv } from "@/server/utils/env";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

const supabaseUrl = requireEnv("SUPABASE_URL");
const supabaseKey = requireEnv("SUPABASE_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

export type SupabaseClient = typeof supabaseClient;

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) {
    return [];
  }

  const forwardedProto = context.request.headers.get("x-forwarded-proto");
  const isSecureFromHeader = forwardedProto === "https";
  const siteUrl = getEnv("PUBLIC_SITE_URL") || "";
  const isSecureFromUrl = siteUrl.startsWith("https://");
  const isSecure = isSecureFromHeader || isSecureFromUrl;

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
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
    cookieOptions,
  });
};
