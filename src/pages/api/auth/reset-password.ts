import { createSupabaseServerInstance } from "@/db/supabase.client";
import { successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import { IdentityService } from "@/server/modules/identity";
import { resetPasswordApiSchema } from "@/shared/schema/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = resetPasswordApiSchema.parse(body);

    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const identityService = new IdentityService(supabase);
    await identityService.resetPassword(result);

    return successResponse({ message: "Password reset successfully" });
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
