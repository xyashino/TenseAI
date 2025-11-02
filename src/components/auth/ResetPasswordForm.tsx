import { Alert } from "@/components/auth/common/Alert";
import { AuthCard } from "@/components/auth/common/AuthCard";
import { AuthFooterLink } from "@/components/auth/common/AuthFooterLink";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiClientError } from "@/lib/api-client";
import { useResetPassword } from "@/lib/hooks/use-auth-mutations";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState("");
  const resetPasswordMutation = useResetPassword();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError("");

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: data.password,
      });
      window.location.href = "/login?reset=success";
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.data.message || err.message || "Failed to reset password");
      } else if (err instanceof Error) {
        setError(err.message || "Failed to reset password");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AuthCard title="Set new password" description="Enter a new password for your account">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {error && <Alert variant="error">{error}</Alert>}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="password">New Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        disabled={resetPasswordMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        disabled={resetPasswordMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </>
                )}
              />
              <div>
                <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? "Resetting password..." : "Reset Password"}
                </Button>
                <AuthFooterLink text="Remember your password?" linkText="Log in" href="/login" />
              </div>
            </div>
          </form>
        </Form>
      </AuthCard>
    </div>
  );
}
