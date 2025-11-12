import { AuthCard, AuthFooterLink } from "@/components/auth/common";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { useForgotPassword } from "@/lib/hooks/use-auth-mutations";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

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
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
