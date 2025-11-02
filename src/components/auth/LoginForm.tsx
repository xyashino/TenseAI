import { Alert } from "@/components/auth/common/Alert";
import { AuthCard } from "@/components/auth/common/AuthCard";
import { AuthFooterLink } from "@/components/auth/common/AuthFooterLink";
import { LegalFooter } from "@/components/auth/common/LegalFooter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/hooks/use-auth-mutations";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutateAsync: login, isPending, isError, error } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
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
    <div className="flex flex-col gap-6">
      <AuthCard title="Welcome back" description="Login to continue learning English grammar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {isError && <Alert variant="error">{error.message}</Alert>}
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
                  {isPending ? "Logging in..." : "Login"}
                </Button>
                <AuthFooterLink text="Don't have an account?" linkText="Sign up" href="/register" />
              </div>
            </div>
          </form>
        </Form>
      </AuthCard>
      <LegalFooter />
    </div>
  );
}
