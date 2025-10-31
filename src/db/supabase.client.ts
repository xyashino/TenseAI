import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

export type SupabaseClient = typeof supabaseClient;

export const cookieOptions: CookieOptionsWithName = {
  name: "sb-token",
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerClient = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet: { name: string; value: string; options?: unknown }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          context.cookies.set(name, value, options as Parameters<AstroCookies["set"]>[2])
        );
      },
    },
  });

  return supabase;
};
