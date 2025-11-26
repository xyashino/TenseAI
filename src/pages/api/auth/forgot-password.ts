import { createSupabaseServerInstance } from "@/db/supabase.client";
import { IdentityService } from "@/server/modules/identity";
import { successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import { forgotPasswordApiSchema } from "@/shared/schema/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = forgotPasswordApiSchema.parse(body);

    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const identityService = new IdentityService(supabase);
    await identityService.forgotPassword(result, context.url.origin);

    return successResponse({ message: "Password reset email sent" });
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
