import { RateLimitError } from "@/server/errors/api-errors";
import { QuestionReportRepository } from "@/server/repositories/question-report.repository";
import { rateLimitService } from "@/server/services/rate-limit.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { buildPaginationMeta } from "@/server/utils/pagination";
import {
  createQuestionReportSchema,
  getQuestionReportsQuerySchema,
} from "@/server/validation/question-report.validation";
import type { PaginationMeta, QuestionReportInsert, QuestionReportsListResponseDTO } from "@/types";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * GET /api/question-reports
 *
 * Get current user's question reports with pagination and optional filtering.
 *
 * Query Parameters:
 * - page (optional): Page number (1-based), default 1
 * - limit (optional): Items per page (1-100), default 20
 * - status (optional): Filter by status ("pending" | "reviewed" | "resolved")
 *
 * Success Response (200):
 * {
 *   "reports": [
 *     {
 *       "id": "uuid",
 *       "question_id": "uuid",
 *       "user_id": "uuid",
 *       "report_comment": "string or null",
 *       "status": "pending" | "reviewed" | "resolved",
 *       "created_at": "ISO 8601 datetime",
 *       "reviewed_at": "ISO 8601 datetime or null",
 *       "reviewed_by": "string or null",
 *       "question_preview": {
 *         "question_text": "string",
 *         "tense": "string"
 *       }
 *     }
 *   ],
 *   "pagination": {
 *     "current_page": 1,
 *     "total_pages": 3,
 *     "total_items": 47,
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
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      status: url.searchParams.get("status"),
    };

    const validated = getQuestionReportsQuerySchema.parse(queryParams);
    const repository = new QuestionReportRepository(supabase);

    const { reports, total } = await repository.getUserReports(
      userId,
      validated.page,
      validated.limit,
      validated.status
    );

    const pagination: PaginationMeta = buildPaginationMeta({
      totalItems: total,
      page: validated.page,
      limit: validated.limit,
    });

    const response: QuestionReportsListResponseDTO = {
      reports,
      pagination,
    };

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

    const body = await context.request.json();
    const validated = createQuestionReportSchema.parse(body);

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

    const repository = new QuestionReportRepository(supabase);
    await repository.verifyQuestionExists(validated.question_id);

    const reportData: QuestionReportInsert = {
      question_id: validated.question_id,
      user_id: userId,
      report_comment: validated.report_comment || null,
      status: "pending",
    };

    const report = await repository.createReport(reportData);

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
