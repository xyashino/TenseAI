import type { SupabaseClient } from "@/db/supabase.client";
import type { QuestionReport, QuestionReportInsert } from "@/types";
import { NotFoundError } from "@/server/errors/api-errors";

export class QuestionReportRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Verify that a question exists
   * @throws NotFoundError if question doesn't exist
   */
  async verifyQuestionExists(questionId: string): Promise<void> {
    const { data, error } = await this.supabase.from("questions").select("id").eq("id", questionId).single();

    if (error || !data) {
      throw new NotFoundError("Question not found");
    }
  }

  /**
   * Create a new question report
   * @throws Error if insert fails
   */
  async createReport(reportData: QuestionReportInsert): Promise<QuestionReport> {
    const { data, error } = await this.supabase.from("question_reports").insert(reportData).select().single();

    if (error || !data) {
      throw new Error(`Failed to create question report: ${error?.message}`);
    }

    return data;
  }
}
