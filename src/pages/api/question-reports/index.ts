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
