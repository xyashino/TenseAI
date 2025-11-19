import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  default_difficulty: z.enum(["Basic", "Advanced"]),
});

export const onboardingFormSchema = profileFormSchema;

export const accountFormSchema = profileFormSchema;

export const reportSchema = z.object({
  comment: z
    .string()
    .max(1000, { message: "Comment must be 1000 characters or less" })
    .min(1, { message: "Comment is required" }),
});

export const startSessionSchema = z.object({
  tense: z.enum(["Present Simple", "Past Simple", "Present Perfect", "Future Simple"]),
  difficulty: z.enum(["Basic", "Advanced"]),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;
export type AccountFormData = z.infer<typeof accountFormSchema>;
export type ReportFormValues = z.infer<typeof reportSchema>;
export type StartSessionFormData = z.infer<typeof startSessionSchema>;
