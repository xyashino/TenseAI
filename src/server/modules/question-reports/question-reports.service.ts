import type { Database } from "@/db/database.types";
import { BadRequestError, RateLimitError } from "@/server/errors/api-errors";
import { rateLimitService } from "@/server/services/rate-limit.service";
import type { SupabaseClient } from "@/db/supabase.client";
import { QuestionReportRepository } from "./question-reports.repository";
import type {
  CreateQuestionReportInput,
  GetQuestionReportsInput,
  GetQuestionReportsOutput,
  QuestionReportOutput,
} from "./question-reports.types";

export class QuestionReportService {
  private repo: QuestionReportRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new QuestionReportRepository(supabase);
  }

  async getUserReports(userId: string, input: GetQuestionReportsInput): Promise<GetQuestionReportsOutput> {
    try {
      const { reports, total } = await this.repo.getUserReports(userId, input.page, input.limit, input.status);

      return {
        reports,
        total,
      };
    } catch (error) {
      throw new BadRequestError(`Failed to fetch reports: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async createReport(userId: string, input: CreateQuestionReportInput): Promise<QuestionReportOutput> {
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

    await this.repo.verifyQuestionExists(input.question_id);

    try {
      const report = await this.repo.createReport({
        question_id: input.question_id,
        user_id: userId,
        report_comment: input.report_comment || null,
        status: "pending",
      });

      return {
        id: report.id,
        question_id: report.question_id,
        user_id: report.user_id,
        report_comment: report.report_comment,
        status: report.status,
        created_at: report.created_at,
      };
    } catch (error) {
      throw new BadRequestError(`Failed to create report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
