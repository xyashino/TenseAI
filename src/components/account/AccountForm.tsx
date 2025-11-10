import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateProfile } from "@/lib/hooks/use-profile";
import type { ProfileDTO } from "@/types";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  default_difficulty: z.enum(["Basic", "Advanced"]),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  initialProfile: ProfileDTO | null;
}

export function AccountForm({ initialProfile }: AccountFormProps) {
  const form = useForm<AccountFormData>({
    resolver: standardSchemaResolver(accountFormSchema),
    defaultValues: {
      name: initialProfile?.name || "",
      default_difficulty: initialProfile?.default_difficulty || "Basic",
    },
  });

  const updateProfile = useUpdateProfile();

  const onSubmit = async (data: AccountFormData) => {
    updateProfile.mutate({
      name: data.name,
      default_difficulty: data.default_difficulty,
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold">Account Settings</h1>
      <p className="mb-6 text-muted-foreground">Manage your account settings and preferences.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormControl>
                  <Input {...field} id="name" placeholder="Enter your name" disabled={updateProfile.isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="default_difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="difficulty">Default Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={updateProfile.isPending}>
                  <FormControl>
                    <SelectTrigger id="difficulty" className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Basic">Basic (A2/B1)</SelectItem>
                    <SelectItem value="Advanced">Advanced (B2)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.formState.isDirty || updateProfile.isPending}
            className="w-full sm:w-auto ml-auto"
          >
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
