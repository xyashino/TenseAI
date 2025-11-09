import { TrainingSessionService } from "@/server/services/training-session.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { completeSessionParamsSchema } from "@/server/validation/session.validation";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * POST /api/training-sessions/{sessionId}/complete
 *
 * Finalizes a training session after all 3 rounds have been completed.
 * This endpoint orchestrates the completion process by:
 * - Verifying all rounds are completed
 * - Analyzing user performance across all rounds
 * - Generating AI-powered personalized feedback (or congratulations for perfect scores)
 * - Updating the session status to 'completed'
 * - Returning comprehensive session statistics
 *
 * Path Parameters:
 * - sessionId: UUID - The unique identifier of the training session to complete
 *
 * Authentication: Required (JWT token in Authorization header)
 *
 * Validation Rules:
 * - Session must belong to the authenticated user
 * - Session status must be 'active' (not already completed)
 * - All 3 rounds must be completed
 *
 * Business Logic Flow:
 * 1. Authenticate user and validate sessionId format
 * 2. Fetch session with all rounds, questions, and user answers
 * 3. Validate session state (active, belongs to user)
 * 4. Validate all 3 rounds are completed
 * 5. Calculate summary statistics (total score, accuracy, etc.)
 * 6. Collect all incorrect answers across all rounds
 * 7. Generate final feedback:
 *    - If perfect score (30/30): Generate congratulations message
 *    - Otherwise: Generate personalized AI feedback analyzing errors
 * 8. Update session to 'completed' status with feedback
 * 9. Return session summary and feedback
 *
 * Success Response (200 OK):
 * {
 *   "training_session": {
 *     "id": "uuid",
 *     "tense": "Present Simple",
 *     "difficulty": "Basic",
 *     "status": "completed",
 *     "final_feedback": "# Great Progress!\n\n## Areas for Improvement...",
 *     "started_at": "2025-01-09T10:00:00Z",
 *     "completed_at": "2025-01-09T10:45:00Z"
 *   },
 *   "summary": {
 *     "rounds_scores": [7, 8, 9],
 *     "total_score": "24/30",
 *     "accuracy_percentage": 80.0,
 *     "incorrect_count": 6,
 *     "perfect_score": false
 *   }
 * }
 *
 * Error Responses:
 * - 400: Session already completed or not all rounds are completed
 *   {
 *     "error": "Bad Request",
 *     "message": "This session has already been completed",
 *     "details": { "completed_at": "2025-01-09T10:45:00Z" }
 *   }
 * - 400: Incomplete rounds
 *   {
 *     "error": "Bad Request",
 *     "message": "All 3 rounds must be completed first",
 *     "details": { "completed_rounds": 2, "required_rounds": 3 }
 *   }
 * - 401: Missing or invalid authentication token
 * - 403: Session does not belong to current user
 * - 404: Session not found
 * - 500: Internal server error (AI service failure, database error)
 */
export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = completeSessionParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const sessionService = new TrainingSessionService(supabase);
    const result = await sessionService.completeSession(userId, sessionId);

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
