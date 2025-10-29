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
