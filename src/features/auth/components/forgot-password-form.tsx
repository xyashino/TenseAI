import { withQueryClient } from "@/components/providers/with-query-client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NavigationRoutes } from "@/shared/enums/navigation";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/shared/schema/auth";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { useForgotPassword } from "../hooks/use-auth-mutations";
import { AuthCard, AuthFooterLink } from "./common";

export function ForgotPasswordForm() {
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

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
    <div className="flex flex-col gap-6 w-full">
      <AuthCard
        title="Reset your password"
        description="Enter your email address and we'll send you a link to reset your password"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
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
                  Send Reset Link
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

export const ForgotPasswordFormWithQueryClient = withQueryClient(ForgotPasswordForm);
