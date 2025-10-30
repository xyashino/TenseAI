import { RateLimitError } from "@/server/errors/api-errors";
import { rateLimitService } from "@/server/services/rate-limit.service";
import { TrainingSessionService } from "@/server/services/training-session.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { createSessionSchema, getTrainingSessionsQuerySchema } from "@/server/validation/session.validation";
import type { APIRoute } from "astro";

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

/**
 * GET /api/training-sessions
 *
 * Retrieves a paginated list of training sessions for the authenticated user.
 * Supports filtering by status and customizable sorting.
 *
 * Query Parameters:
 * - status: "active" | "completed" (default: "completed")
 * - page: number (1-based, default: 1)
 * - limit: number (1-100, default: 20)
 * - sort: "started_at_desc" | "started_at_asc" (default: "started_at_desc")
 *
 * Success Response (200):
 * {
 *   "training-sessions": [
 *     {
 *       "id": "uuid",
 *       "tense": "Present Simple",
 *       "difficulty": "Basic",
 *       "status": "completed",
 *       "started_at": "2024-01-15T10:30:00Z",
 *       "completed_at": "2024-01-15T11:15:00Z",
 *       "rounds_summary": [
 *         {
 *           "id": "string",
 *           "round_number": number;
 *           "score": number | null;
 *           "completed_at": string | null;
 *         }
 *       ],
 *       "progress": null
 *     }
 *   ],
 *   "pagination": {
 *     "current_page": 1,
 *     "total_pages": 5,
 *     "total_items": 87,
 *     "items_per_page": 20,
 *     "has_next": true,
 *     "has_previous": false
 *   }
 * }
 *
 * Error Responses:
 * - 400: Invalid query parameters
 * - 401: Authentication required
 * - 500: Internal server error
 */
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

    const sessionService = new TrainingSessionService(supabase);
    const response = await sessionService.getSessionsList(
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
