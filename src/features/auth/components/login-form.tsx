import { AuthCard, AuthFooterLink, LegalFooter } from "./common";
import { withQueryClient } from "@/components/providers/with-query-client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NavigationRoutes } from "@/shared/enums/navigation";
import { useLogin } from "../hooks/use-auth-mutations";
import { loginSchema, type LoginFormValues } from "@/shared/schema/auth";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

function LoginForm() {
  const { mutateAsync: login, isPending } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AuthCard title="Welcome back" description="Login to continue learning English grammar">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <>
                    <div className="flex items-center">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <a href="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
                        Forgot your password?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
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
                  Login
                </Button>
                <AuthFooterLink text="Don't have an account?" linkText="Sign up" href={NavigationRoutes.REGISTER} />
              </div>
            </div>
          </form>
        </Form>
      </AuthCard>
      <LegalFooter />
    </div>
  );
}

export { LoginForm };
export const LoginFormWithQueryClient = withQueryClient(LoginForm);
