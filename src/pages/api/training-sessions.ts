import type { APIRoute } from "astro";
import { createSessionSchema } from "@/server/validation/session.validation";
import { rateLimitService } from "@/server/services/rate-limit.service";
import { TrainingSessionService } from "@/server/services/training-session.service";
import { RateLimitError } from "@/server/errors/api-errors";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";

export const prerender = false;

/**
 * POST /api/training-sessions
 *
 * Creates a new training session with the first round and 10 AI-generated questions.
 *
 * Request Body:
 * {
 *   "tense": "Present Simple" | "Past Simple" | "Present Perfect" | "Future Simple",
 *   "difficulty": "Basic" | "Advanced"
 * }
 *
 * Rate Limit: 2 requests per minute per user
 *
 * Success Response (201):
 * {
 *   "training_session": { id, user_id, tense, difficulty, status, started_at, created_at },
 *   "current_round": {
 *     id, session_id, round_number, started_at,
 *     questions: [{ id, question_number, question_text, options }]
 *   }
 * }
 *
 * Error Responses:
 * - 401: Authentication required
 * - 422: Validation failed
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 */
export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const body = await context.request.json();
    const validated = createSessionSchema.parse(body);

    const rateLimitCheck = await rateLimitService.checkLimit(userId, "session_create", {
      limit: 2,
      windowSeconds: 60,
    });

    if (!rateLimitCheck.allowed) {
      throw new RateLimitError(
        "You can create up to 2 sessions per minute. Please try again later.",
        rateLimitCheck.retryAfter
      );
    }

    const sessionService = new TrainingSessionService(supabase);
    const result = await sessionService.createSession(userId, validated);

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
