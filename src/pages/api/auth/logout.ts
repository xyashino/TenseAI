import { createSupabaseServerClient } from "@/db/supabase.client";
import { InternalServerError } from "@/server/errors/api-errors";
import { successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const supabase = createSupabaseServerClient({
      request: context.request,
      cookies: context.cookies,
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new InternalServerError("Failed to sign out");
    }

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
