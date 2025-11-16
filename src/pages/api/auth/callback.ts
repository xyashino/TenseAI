import { createSupabaseServerInstance } from "@/db/supabase.client";
import { BadRequestError } from "@/server/errors/api-errors";
import { handleApiError } from "@/server/utils/error-handler";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  try {
    const code = context.url.searchParams.get("code");

    if (!code) {
      throw new BadRequestError("Authorization code is required");
    }

    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new BadRequestError("Invalid authorization code");
    }

    return context.redirect("/dashboard");
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
