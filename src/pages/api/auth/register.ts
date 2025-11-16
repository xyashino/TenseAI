import { createSupabaseServerInstance } from "@/db/supabase.client";
import { BadRequestError } from "@/server/errors/api-errors";
import { HttpStatus, successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import { registerSchema } from "@/server/validation/auth.validation";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = registerSchema.parse(body);

    const { email, password } = result;
    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new BadRequestError(error.message);
    }

    if (!data.user) {
      throw new BadRequestError("Failed to create user");
    }

    return successResponse(data.user, HttpStatus.CREATED);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
