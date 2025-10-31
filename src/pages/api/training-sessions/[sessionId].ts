import { TrainingSessionService } from "@/server/services/training-session.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { getSessionDetailParamsSchema } from "@/server/validation/session.validation";
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
