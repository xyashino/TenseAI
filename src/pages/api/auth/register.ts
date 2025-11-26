import { createSupabaseServerInstance } from "@/db/supabase.client";
import { IdentityService } from "@/server/modules/identity";
import { HttpStatus, successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import { registerApiSchema } from "@/shared/schema/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = registerApiSchema.parse(body);

    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const origin = context.url.origin;
    const redirectTo = `${origin}/api/auth/callback`;

    const identityService = new IdentityService(supabase);
    const user = await identityService.register(result, redirectTo);

    return successResponse(user, HttpStatus.CREATED);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
