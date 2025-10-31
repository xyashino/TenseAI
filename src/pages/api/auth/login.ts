import { createSupabaseServerClient } from "@/db/supabase.client";
import { BadRequestError } from "@/server/errors/api-errors";
import { successResponse } from "@/server/utils/api-response";
import { handleApiError } from "@/server/utils/error-handler";
import type { APIRoute } from "astro";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const result = loginSchema.parse(body);

    const { email, password } = result;
    const supabase = createSupabaseServerClient({
      headers: context.request.headers,
      cookies: context.cookies,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new BadRequestError("Invalid credentials");
    }

    return successResponse(data.user);
  } catch (error) {
    return handleApiError(error);
  }
};

export const prerender = false;
