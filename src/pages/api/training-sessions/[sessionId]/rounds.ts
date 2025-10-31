import { RateLimitError } from "@/server/errors/api-errors";
import { rateLimitService } from "@/server/services/rate-limit.service";
import { TrainingSessionService } from "@/server/services/training-session.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { createRoundParamsSchema } from "@/server/validation/session.validation";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * POST /api/training-sessions/{sessionId}/rounds
 *
 * Creates and starts the next round (1, 2, or 3) in an active training session.
 * This endpoint generates 10 AI questions for the round and returns them without answers.
 *
 * Path Parameters:
 * - sessionId: UUID - The unique identifier of the training session
 *
 * Authentication: Required (JWT token in Authorization header)
 *
 * Rate Limit: 2 requests per minute per user for AI question generation
 *
 * Validation Rules:
 * - Session must belong to the authenticated user
 * - Session must have status 'active'
 * - Round 1: Can only be created if no rounds exist yet
 * - Round 2: Can only be created if Round 1 is completed
 * - Round 3: Can only be created if Round 2 is completed
 * - Cannot create more than 3 rounds per session
 *
 * Business Logic Flow:
 * 1. Authenticate user and validate sessionId format
 * 2. Check AI generation rate limit (2 per minute)
 * 3. Verify session exists, belongs to user, and is active
 * 4. Determine next round number based on existing rounds
 * 5. Validate that previous round is completed (if not Round 1)
 * 6. Create round record in database
 * 7. Generate 10 questions via AI service (or mock service for MVP)
 * 8. Save questions to database
 * 9. Return round with questions (without correct answers)
 *
 * Success Response (201 Created):
 * {
 *   "round": {
 *     "id": "uuid",
 *     "session_id": "uuid",
 *     "round_number": 1,  // Can be 1, 2, or 3
 *     "started_at": "2024-01-15T10:30:00.000Z"
 *   },
 *   "questions": [
 *     {
 *       "id": "uuid",
 *       "question_number": 1,
 *       "question_text": "She ___ to work every day.",
 *       "options": ["go", "goes", "going", "went"]
 *     },
 *     // ... 9 more questions
 *   ]
 * }
 *
 * Error Responses:
 * - 400: Cannot create round (previous round not completed, or already have 3 rounds, or session not active)
 * - 401: Missing or invalid authentication token
 * - 403: Session does not belong to current user
 * - 404: Session not found
 * - 429: AI generation rate limit exceeded (retry_after in seconds)
 * - 500: Internal server error (AI service failure, database error)
 */
export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = createRoundParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const rateLimitCheck = await rateLimitService.checkLimit(userId, "ai_question_generation", {
      limit: 2,
      windowSeconds: 60,
    });

    if (!rateLimitCheck.allowed) {
      throw new RateLimitError(
        "You can generate questions up to 2 times per minute. Please try again later.",
        rateLimitCheck.retryAfter
      );
    }

    const sessionService = new TrainingSessionService(supabase);
    const result = await sessionService.createRound(userId, sessionId);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `/api/training-sessions/${sessionId}/rounds/${result.round.round_number}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
