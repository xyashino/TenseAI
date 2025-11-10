import { Alert } from "@/components/auth/common/Alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResetEmail } from "@/lib/hooks/use-auth-mutations";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resetEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResetEmailFormValues = z.infer<typeof resetEmailSchema>;

interface ResetEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail?: string;
}

export function ResetEmailDialog({ open, onOpenChange, currentEmail }: ResetEmailDialogProps) {
  const { mutateAsync: resetEmail, isPending, isError, error, isSuccess } = useResetEmail();

  const form = useForm<ResetEmailFormValues>({
    resolver: standardSchemaResolver(resetEmailSchema),
    defaultValues: {
      email: currentEmail || "",
    },
  });

  const onSubmit = async (data: ResetEmailFormValues) => {
    try {
      await resetEmail({ email: data.email });
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch {
      // Error is handled by isError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Email</DialogTitle>
          <DialogDescription>Enter a new email address for your account</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isError && <Alert variant="error">{error?.message || "Failed to reset email"}</Alert>}
            {isSuccess && (
              <Alert variant="success">
                Email reset link sent! Please check your new email address to confirm the change.
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">New Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your new email"
                      autoComplete="email"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Reset Email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
