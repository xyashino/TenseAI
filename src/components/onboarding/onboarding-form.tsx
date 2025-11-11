import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

const onboardingFormSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  default_difficulty: z.enum(["Basic", "Advanced"]),
});

type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

export function OnboardingForm() {
  const { mutateAsync: updateProfile, isPending } = useOnboarding();
  const form = useForm<OnboardingFormData>({
    resolver: standardSchemaResolver(onboardingFormSchema),
    defaultValues: {
      name: "",
      default_difficulty: "Basic",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateProfile(data))} className="flex flex-col gap-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name" className="text-base font-medium">
                Your Name
              </FormLabel>
              <FormControl>
                <Input {...field} id="name" type="text" placeholder="Enter your name" disabled={isPending} />
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
              <FormLabel className="text-base font-medium">Choose your path</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Basic">Basic - Recommended for beginners</SelectItem>
                  <SelectItem value="Advanced">Advanced - For those who want a challenge</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full font-semibold">
          Finish Setup
        </Button>
      </form>
    </Form>
  );
}
