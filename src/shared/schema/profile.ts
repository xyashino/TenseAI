import { Constants } from "@/db/database.types";
import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  default_difficulty: z.enum(["Basic", "Advanced"]),
});

export const onboardingFormSchema = profileFormSchema;
export const accountFormSchema = profileFormSchema;

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    default_difficulty: z.enum(Constants.public.Enums.difficulty_level).optional(),
    onboarding_completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;
export type AccountFormData = z.infer<typeof accountFormSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export const updateProfileApiSchema = updateProfileSchema;
