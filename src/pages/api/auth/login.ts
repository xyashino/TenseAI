import { createSupabaseServerInstance } from "@/db/supabase.client";
import { AuthenticationError } from "@/server/errors/api-errors";
import { successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import { loginSchema } from "@/server/validation/auth.validation";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = loginSchema.parse(body);

    const { email, password } = result;
    const supabase = createSupabaseServerInstance({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthenticationError("Invalid credentials");
    }

    return successResponse(data.user);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
