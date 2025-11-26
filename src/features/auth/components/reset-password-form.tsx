import { AuthCard, AuthFooterLink } from "./common";
import { withQueryClient } from "@/components/providers/with-query-client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NavigationRoutes } from "@/shared/enums/navigation";
import { useResetPassword } from "../hooks/use-auth-mutations";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/shared/schema/auth";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

interface ResetPasswordFormProps {
  token: string;
}

function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { mutateAsync: resetPassword, isPending } = useResetPassword();

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
    <AuthCard title="Set new password" description="Enter a new password for your account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
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
                Reset Password
              </Button>
              <AuthFooterLink text="Remember your password?" linkText="Log in" href={NavigationRoutes.LOGIN} />
            </div>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}

export { ResetPasswordForm };
export const ResetPasswordFormWithQueryClient = withQueryClient(ResetPasswordForm);
