import { TrainingSessionService } from "@/server/services/training-session.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { completeRoundBodySchema, completeRoundParamsSchema } from "@/server/validation/session.validation";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * POST /api/rounds/{roundId}/complete
 *
 * Complete a round by submitting all 10 answers, calculate score, and generate AI feedback.
 *
 * Path Parameters:
 * - roundId: UUID - The unique identifier of the round to complete
 *
 * Request Body:
 * {
 *   "answers": [
 *     { "question_id": "uuid", "selected_answer": "string" },
 *     // ... exactly 10 items total
 *   ]
 * }
 *
 * Authentication: Required (JWT token in Authorization header)
 *
 * Validation Rules:
 * - Round must belong to a session owned by current user
 * - Request must include exactly 10 answers
 * - Each question_id must belong to this roundId and be unique within the payload
 * - Each selected_answer must match one of the question's options
 * - Round must not already be completed
 *
 * Business Logic Flow:
 * 1. Authenticate user and validate request structure
 * 2. Fetch round with session for authorization check
 * 3. Verify round is not already completed
 * 4. Fetch all questions for the round with correct answers
 * 5. Validate all answers against questions (membership, options)
 * 6. Calculate correctness for each answer
 * 7. Insert all user_answers in a single transaction
 * 8. Calculate round score (count correct answers)
 * 9. Generate AI feedback for incorrect answers
 * 10. Update round with score, feedback, and completed_at timestamp
 * 11. Return complete review with all questions and validation results
 *
 * Success Response (200 OK):
 * {
 *   "round": {
 *     "id": "uuid",
 *     "round_number": 1,
 *     "score": 7,
 *     "round_feedback": "string (Markdown)",
 *     "started_at": "ISO 8601 datetime",
 *     "completed_at": "ISO 8601 datetime"
 *   },
 *   "questions_review": [
 *     {
 *       "question_number": 1,
 *       "question_text": "string",
 *       "options": ["string", "string", "string", "string"],
 *       "user_answer": "string",
 *       "correct_answer": "string",
 *       "is_correct": true
 *     },
 *     // ... all 10 questions with validation results
 *   ]
 * }
 *
 * Error Responses:
 * - 400: Invalid payload (wrong count, invalid question, invalid option), or round already completed
 * - 401: Missing or invalid authentication token
 * - 403: Round does not belong to user's session
 * - 404: Round not found
 * - 500: Database error or AI service failure
 */
export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { roundId } = completeRoundParamsSchema.parse({
      roundId: context.params.roundId,
    });

    const body = await context.request.json();
    const { answers } = completeRoundBodySchema.parse(body);

    const sessionService = new TrainingSessionService(supabase);
    const result = await sessionService.completeRound(userId, roundId, answers);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
