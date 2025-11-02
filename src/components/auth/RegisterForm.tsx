import { Alert } from "@/components/auth/common/Alert";
import { AuthCard } from "@/components/auth/common/AuthCard";
import { AuthFooterLink } from "@/components/auth/common/AuthFooterLink";
import { LegalFooter } from "@/components/auth/common/LegalFooter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/lib/hooks/use-auth-mutations";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

const registerSchema = z
  .object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { mutateAsync: register, isPending, isError, error } = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await register({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AuthCard title="Create an account" description="Start mastering English grammar with AI">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {isError && <Alert variant="error">{error?.message}</Alert>}
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
                    <FormLabel htmlFor="password">Password</FormLabel>
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
                    <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
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
                  {isPending ? "Creating account..." : "Create Account"}
                </Button>
                <AuthFooterLink text="Already have an account?" linkText="Log in" href="/login" />
              </div>
            </div>
          </form>
        </Form>
      </AuthCard>
      <LegalFooter />
    </div>
  );
}
