import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  default_difficulty: z.enum(["Basic", "Advanced"]),
});

export const onboardingFormSchema = profileFormSchema;

export const accountFormSchema = profileFormSchema;

export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerSchema = z
  .object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

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
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ReportFormValues = z.infer<typeof reportSchema>;
export type StartSessionFormData = z.infer<typeof startSessionSchema>;
