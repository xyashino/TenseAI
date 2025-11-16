import { createSupabaseServerInstance } from "@/db/supabase.client";
import { BadRequestError, UnauthorizedError } from "@/server/errors/api-errors";
import { successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import { resetPasswordSchema } from "@/server/validation/auth.validation";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = resetPasswordSchema.parse(body);

    const { password } = result;
    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError("No active session");
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new BadRequestError("Failed to reset password");
    }

    return successResponse({ message: "Password reset successfully" });
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
