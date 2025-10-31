import { z } from "zod";

export const createSessionSchema = z.object({
  tense: z.enum(["Present Simple", "Past Simple", "Present Perfect", "Future Simple"], {
    error: () => `Invalid tense. Must be one of: Present Simple, Past Simple, Present Perfect, Future Simple`,
  }),
  difficulty: z.enum(["Basic", "Advanced"], {
    error: () => `Invalid difficulty. Must be either Basic or Advanced`,
  }),
});

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
