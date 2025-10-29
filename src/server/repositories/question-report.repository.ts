import type { SupabaseClient } from "@/db/supabase.client";
import type { QuestionReport, QuestionReportInsert, QuestionReportWithPreview } from "@/types";
import { NotFoundError } from "@/server/errors/api-errors";

export class QuestionReportRepository {
  constructor(private supabase: SupabaseClient) {}

  async verifyQuestionExists(questionId: string): Promise<void> {
    const { data, error } = await this.supabase.from("questions").select("id").eq("id", questionId).single();

    if (error || !data) {
      throw new NotFoundError("Question not found");
    }
  }

  async createReport(reportData: QuestionReportInsert): Promise<QuestionReport> {
    const { data, error } = await this.supabase.from("question_reports").insert(reportData).select().single();

    if (error || !data) {
      throw new Error(`Failed to create question report: ${error?.message}`);
    }

    return data;
  }

  /**
   * Get paginated question reports for a specific user with optional status filtering
   * @param userId - The ID of the user whose reports to retrieve
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param status - Optional filter by report status
   * @returns Object containing reports array and total count
   * @throws Error if query fails
   */
  async getUserReports(
    userId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<{
    reports: QuestionReportWithPreview[];
    total: number;
  }> {
    const offset = (page - 1) * limit;

    let countQuery = this.supabase
      .from("question_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    let dataQuery = this.supabase
      .from("question_reports")
      .select(
        `
        *,
        questions!inner(
          question_text,
          rounds!inner(
            training_sessions!inner(
              tense
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply optional status filter to both queries
    if (status) {
      countQuery = countQuery.eq("status", status);
      dataQuery = dataQuery.eq("status", status);
    }

    // Execute queries in parallel
    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    // Handle count query errors
    if (countResult.error) {
      throw new Error(`Failed to count reports: ${countResult.error.message}`);
    }

    // Handle data query errors
    if (dataResult.error || !dataResult.data) {
      throw new Error(`Failed to fetch reports: ${dataResult.error?.message}`);
    }

    // Transform data to match QuestionReportWithPreview type
    const reports: QuestionReportWithPreview[] = dataResult.data.map((row) => ({
      id: row.id,
      question_id: row.question_id,
      user_id: row.user_id,
      report_comment: row.report_comment,
      status: row.status,
      created_at: row.created_at,
      reviewed_at: row.reviewed_at,
      reviewed_by: row.reviewed_by,
      question_preview: {
        question_text: row.questions.question_text,
        tense: row.questions.rounds.training_sessions.tense,
      },
    }));

    return {
      reports,
      total: countResult.count || 0,
    };
  }
}
