import { RateLimitError } from "@/server/errors/api-errors";
import { TrainingService } from "@/server/modules/training";
import { rateLimitService } from "@/server/services/rate-limit.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { createSessionSchema, getTrainingSessionsQuerySchema } from "@/shared/schema/training.schema";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const body = await context.request.json();
    const validated = createSessionSchema.parse(body);

    const rateLimitCheck = await rateLimitService.checkLimit(userId, "session_create", {
      limit: 15,
      windowSeconds: 60,
    });

    if (!rateLimitCheck.allowed) {
      throw new RateLimitError(
        "You can create up to 10 sessions per minute. Please try again later.",
        rateLimitCheck.retryAfter
      );
    }

    const trainingService = new TrainingService(supabase);
    const result = await trainingService.createSession(userId, validated);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `/api/training-sessions/${result.training_session.id}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const GET: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const url = new URL(context.request.url);
    const queryParams = {
      status: url.searchParams.get("status"),
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      sort: url.searchParams.get("sort"),
    };

    const validated = getTrainingSessionsQuerySchema.parse(queryParams);

    const trainingService = new TrainingService(supabase);
    const response = await trainingService.getSessionsList(
      userId,
      validated.status,
      validated.page,
      validated.limit,
      validated.sort
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
