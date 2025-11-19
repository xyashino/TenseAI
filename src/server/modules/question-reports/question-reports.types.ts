export interface CreateQuestionReportInput {
  question_id: string;
  report_comment?: string;
}

export interface GetQuestionReportsInput {
  page: number;
  limit: number;
  status?: "pending" | "reviewed" | "resolved";
}

export interface QuestionReportOutput {
  id: string;
  question_id: string;
  user_id: string;
  report_comment: string | null;
  status: string;
  created_at: string;
}

export interface GetQuestionReportsOutput {
  reports: import("@/types").QuestionReportWithPreview[];
  total: number;
}
