import { createSupabaseServerInstance } from "@/db/supabase.client";
import { IdentityService } from "@/server/modules/identity";
import { handleApiError } from "@/server/utils/error-handler";
import { callbackApiSchema } from "@/shared/schema/auth";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  try {
    const code = context.url.searchParams.get("code");
    const result = callbackApiSchema.parse({ code });

    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const identityService = new IdentityService(supabase);
    await identityService.exchangeCodeForSession(result.code);

    return context.redirect("/dashboard");
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
