import { z } from "zod";

export const createQuestionReportSchema = z.object({
  question_id: z.string().uuid({
    message: "question_id must be a valid UUID",
  }),
  report_comment: z
    .string()
    .max(1000, {
      message: "Report comment cannot exceed 1000 characters",
    })
    .optional(),
});

export type CreateQuestionReportValidated = z.infer<typeof createQuestionReportSchema>;

export const getQuestionReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "reviewed", "resolved"]).optional(),
});

export type GetQuestionReportsQueryValidated = z.infer<typeof getQuestionReportsQuerySchema>;
