import type { Database } from "@/db/database.types";
import { NotFoundError } from "@/server/errors/api-errors";
import type { QuestionReport, QuestionReportInsert, QuestionReportWithPreview } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class QuestionReportRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

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

    if (status) {
      countQuery = countQuery.eq("status", status);
      dataQuery = dataQuery.eq("status", status);
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) {
      throw new Error(`Failed to count reports: ${countResult.error.message}`);
    }

    if (dataResult.error || !dataResult.data) {
      throw new Error(`Failed to fetch reports: ${dataResult.error?.message}`);
    }

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
