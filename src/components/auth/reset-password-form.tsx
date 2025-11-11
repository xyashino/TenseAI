import { Alert } from "@/components/auth/common/Alert";
import { AuthCard } from "@/components/auth/common/AuthCard";
import { AuthFooterLink } from "@/components/auth/common/AuthFooterLink";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { useResetPassword } from "@/lib/hooks/use-auth-mutations";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { mutateAsync: resetPassword, isPending, isError, error } = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    await resetPassword({
      token,
      password: data.password,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AuthCard title="Set new password" description="Enter a new password for your account">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {isError && <Alert variant="error">{error?.message}</Alert>}
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
                        disabled={isPending}
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
                  {isPending ? "Resetting password..." : "Reset Password"}
                </Button>
                <AuthFooterLink text="Remember your password?" linkText="Log in" href={NavigationRoutes.LOGIN} />
              </div>
            </div>
          </form>
        </Form>
      </AuthCard>
    </div>
  );
}
