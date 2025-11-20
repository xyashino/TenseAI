import { z } from "zod";

export const startSessionSchema = z.object({
  tense: z.enum(["Present Simple", "Past Simple", "Present Perfect", "Future Simple"]),
  difficulty: z.enum(["Basic", "Advanced"]),
});

export const createSessionSchema = z.object({
  tense: z.enum(["Present Simple", "Past Simple", "Present Perfect", "Future Simple"], {
    error: () => `Invalid tense. Must be one of: Present Simple, Past Simple, Present Perfect, Future Simple`,
  }),
  difficulty: z.enum(["Basic", "Advanced"], {
    error: () => `Invalid difficulty. Must be either Basic or Advanced`,
  }),
});

export type StartSessionFormData = z.infer<typeof startSessionSchema>;
export type CreateSessionValidated = z.infer<typeof createSessionSchema>;

export const getTrainingSessionsQuerySchema = z.object({
  status: z
    .string()
    .nullable()
    .transform((val) => val || "completed")
    .pipe(z.enum(["active", "completed"]))
    .default("completed"),
  page: z
    .string()
    .nullable()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive())
    .default(1),
  limit: z
    .string()
    .nullable()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100))
    .default(20),
  sort: z
    .string()
    .nullable()
    .transform((val) => val || "started_at_desc")
    .pipe(z.enum(["started_at_desc", "started_at_asc"]))
    .default("started_at_desc"),
});

export type GetTrainingSessionsQueryValidated = z.infer<typeof getTrainingSessionsQuerySchema>;

export const getSessionDetailParamsSchema = z.object({
  sessionId: z.string().uuid({
    message: "sessionId must be a valid UUID",
  }),
});

export type GetSessionDetailParamsValidated = z.infer<typeof getSessionDetailParamsSchema>;

export const deleteSessionParamsSchema = z.object({
  sessionId: z.string().uuid({
    message: "sessionId must be a valid UUID",
  }),
});

export type DeleteSessionParamsValidated = z.infer<typeof deleteSessionParamsSchema>;

export const createRoundParamsSchema = z.object({
  sessionId: z.string().uuid({
    message: "sessionId must be a valid UUID",
  }),
});

export type CreateRoundParamsValidated = z.infer<typeof createRoundParamsSchema>;

export const completeRoundParamsSchema = z.object({
  roundId: z.string().uuid({
    message: "roundId must be a valid UUID",
  }),
});

export type CompleteRoundParamsValidated = z.infer<typeof completeRoundParamsSchema>;

export const completeRoundBodySchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid({
          message: "question_id must be a valid UUID",
        }),
        selected_answer: z.string().min(1, {
          message: "selected_answer cannot be empty",
        }),
      })
    )
    .length(10, {
      message: "Must provide exactly 10 answers",
    })
    .refine(
      (answers) => {
        const questionIds = answers.map((a) => a.question_id);
        return new Set(questionIds).size === questionIds.length;
      },
      {
        message: "Duplicate question_id values are not allowed",
      }
    ),
});

export type CompleteRoundBodyValidated = z.infer<typeof completeRoundBodySchema>;

export const completeSessionParamsSchema = z.object({
  sessionId: z.string().uuid({
    message: "sessionId must be a valid UUID",
  }),
});

export type CompleteSessionParamsValidated = z.infer<typeof completeSessionParamsSchema>;
