import type { APIRoute } from "astro";
import { createQuestionReportSchema } from "@/server/validation/question-report.validation";
import { rateLimitService } from "@/server/services/rate-limit.service";
import { QuestionReportRepository } from "@/server/repositories/question-report.repository";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { RateLimitError } from "@/server/errors/api-errors";
import type { QuestionReportInsert } from "@/types";

export const prerender = false;

/**
 * POST /api/question-reports
 *
 * Report a question as potentially incorrect.
 *
 * Request Body:
 * {
 *   "question_id": "uuid",
 *   "report_comment": "string (optional, max 1000 chars)"
 * }
 *
 * Rate Limit: 10 requests per minute per user
 *
 * Success Response (201):
 * {
 *   "report": {
 *     "id": "uuid",
 *     "question_id": "uuid",
 *     "user_id": "uuid",
 *     "report_comment": "string or null",
 *     "status": "pending",
 *     "created_at": "ISO 8601 datetime"
 *   },
 *   "message": "Thank you for your feedback! We will review this question."
 * }
 *
 * Error Responses:
 * - 401: Authentication required
 * - 404: Question not found
 * - 422: Validation failed
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 */
export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    // Parse and validate request body
    const body = await context.request.json();
    const validated = createQuestionReportSchema.parse(body);

    // Check rate limit (10 per minute)
    const rateLimitCheck = await rateLimitService.checkLimit(userId, "report_create", {
      limit: 10,
      windowSeconds: 60,
    });

    if (!rateLimitCheck.allowed) {
      throw new RateLimitError(
        "You can submit up to 10 reports per minute. Please try again later.",
        rateLimitCheck.retryAfter
      );
    }

    // Create repository
    const repository = new QuestionReportRepository(supabase);

    // Verify question exists
    await repository.verifyQuestionExists(validated.question_id);

    // Build insert data
    const reportData: QuestionReportInsert = {
      question_id: validated.question_id,
      user_id: userId,
      report_comment: validated.report_comment || null,
      status: "pending",
    };

    // Create report
    const report = await repository.createReport(reportData);

    // Return success response
    return new Response(
      JSON.stringify({
        report: {
          id: report.id,
          question_id: report.question_id,
          user_id: report.user_id,
          report_comment: report.report_comment,
          status: report.status,
          created_at: report.created_at,
        },
        message: "Thank you for your feedback! We will review this question.",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
};
