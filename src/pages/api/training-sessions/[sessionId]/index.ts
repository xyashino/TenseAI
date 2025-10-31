import { TrainingSessionService } from "@/server/services/training-session.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { deleteSessionParamsSchema, getSessionDetailParamsSchema } from "@/server/validation/session.validation";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * GET /api/training-sessions/{sessionId}
 *
 * Retrieves detailed information about a specific training session, including all rounds,
 * questions, user answers, and performance summary. Designed for viewing completed training
 * sessions in detail.
 *
 * Path Parameters:
 * - sessionId: UUID - The unique identifier of the training session
 *
 * Authentication: Required (JWT token in Authorization header)
 *
 * Success Response (200):
 * {
 *   "training_session": {
 *     "id": "uuid",
 *     "tense": "Present Simple",
 *     "difficulty": "Basic",
 *     "status": "completed",
 *     "final_feedback": "Great job! You've shown...",
 *     "started_at": "2024-01-15T10:30:00.000Z",
 *     "completed_at": "2024-01-15T10:45:00.000Z"
 *   },
 *   "rounds": [
 *     {
 *       "id": "uuid",
 *       "round_number": 1,
 *       "score": 7,
 *       "round_feedback": "Good start...",
 *       "started_at": "2024-01-15T10:30:00.000Z",
 *       "completed_at": "2024-01-15T10:35:00.000Z",
 *       "questions": [
 *         {
 *           "id": "uuid",
 *           "question_number": 1,
 *           "question_text": "She ___ to work every day.",
 *           "options": ["go", "goes", "going", "went"],
 *           "correct_answer": "goes",
 *           "user_answer": {
 *             "selected_answer": "goes",
 *             "is_correct": true,
 *             "answered_at": "2024-01-15T10:31:00.000Z"
 *           }
 *         }
 *       ]
 *     }
 *   ],
 *   "summary": {
 *     "total_questions": 30,
 *     "correct_answers": 24,
 *     "accuracy_percentage": 80,
 *     "rounds_scores": [7, 8, 9]
 *   }
 * }
 *
 * Error Responses:
 * - 400: Invalid sessionId format (must be a valid UUID)
 * - 401: Missing or invalid authentication token
 * - 404: Session not found or doesn't belong to the authenticated user
 * - 500: Internal server error
 */
export const GET: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = getSessionDetailParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const service = new TrainingSessionService(supabase);
    const sessionDetail = await service.getSessionDetail(userId, sessionId);

    return new Response(JSON.stringify(sessionDetail), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * DELETE /api/training-sessions/{sessionId}
 *
 * Deletes a training session. This can be used to abandon an active training session
 * or remove a completed session from the user's history. Related rounds, questions,
 * and user answers are automatically deleted via database cascading rules.
 *
 * Path Parameters:
 * - sessionId: UUID - The unique identifier of the training session to delete
 *
 * Authentication: Required (JWT token in Authorization header)
 *
 * Success Response (204 No Content):
 * No response body is returned on successful deletion.
 *
 * Error Responses:
 * - 400: Invalid sessionId format (must be a valid UUID)
 * - 401: Missing or invalid authentication token
 * - 404: Session not found or doesn't belong to the authenticated user
 * - 500: Internal server error
 */
export const DELETE: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = deleteSessionParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const service = new TrainingSessionService(supabase);
    await service.deleteSession(userId, sessionId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
