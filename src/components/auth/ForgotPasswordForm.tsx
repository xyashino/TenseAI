import { Alert } from "@/components/auth/common/Alert";
import { AuthCard } from "@/components/auth/common/AuthCard";
import { AuthFooterLink } from "@/components/auth/common/AuthFooterLink";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/lib/hooks/use-auth-mutations";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { mutateAsync: forgotPassword, isPending, isError, error, isSuccess } = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await forgotPassword(data);
  };

  return (
    <div className="flex flex-col gap-6">
      <AuthCard
        title="Reset your password"
        description="Enter your email address and we'll send you a link to reset your password"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {isError && <Alert variant="error">{error.message}</Alert>}
              {isSuccess && (
                <Alert variant="success">Password reset link sent! Check your email for instructions.</Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </>
                )}
              />
              <div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Sending..." : "Send Reset Link"}
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
