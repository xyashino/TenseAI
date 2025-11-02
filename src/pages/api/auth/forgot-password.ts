import { createSupabaseServerClient } from "@/db/supabase.client";
import { InternalServerError } from "@/server/errors/api-errors";
import { successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import { forgotPasswordSchema } from "@/server/validation/auth.validation";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = forgotPasswordSchema.parse(body);

    const { email } = result;
    const supabase = createSupabaseServerClient({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${context.url.origin}/auth/reset-password`,
    });

    if (error) {
      throw new InternalServerError("Failed to send password reset email");
    }

    return successResponse({ message: "Password reset email sent" });
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
