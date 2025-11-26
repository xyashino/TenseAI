import { QuestionReportService } from "@/server/modules/question-reports";
import { HttpStatus, successResponse } from "@/server/utils/api-response";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { buildPaginationMeta } from "@/server/utils/pagination";
import {
  createQuestionReportApiSchema,
  getQuestionReportsQueryApiSchema,
} from "@/shared/schema/question-reports";
import type { QuestionReportsListResponseDTO } from "@/features/training/types";
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

    const validated = getQuestionReportsQueryApiSchema.parse(queryParams);
    const service = new QuestionReportService(supabase);

    const { reports, total } = await service.getUserReports(userId, {
      page: validated.page,
      limit: validated.limit,
      status: validated.status,
    });

    const pagination = buildPaginationMeta({
      totalItems: total,
      page: validated.page,
      limit: validated.limit,
    });

    const response: QuestionReportsListResponseDTO = {
      reports,
      pagination,
    };

    return successResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const body = await context.request.json();
    const validated = createQuestionReportApiSchema.parse(body);

    const service = new QuestionReportService(supabase);
    const report = await service.createReport(userId, {
      question_id: validated.question_id,
      report_comment: validated.report_comment,
    });

    return successResponse(
      {
        report,
        message: "Thank you for your feedback! We will review this question.",
      },
      HttpStatus.CREATED
    );
  } catch (error) {
    return handleApiError(error);
  }
};
