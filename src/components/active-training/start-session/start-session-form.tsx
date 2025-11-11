import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { useCreateSession } from "@/lib/hooks/use-create-session";
import { startSessionSchema, type StartSessionFormData } from "@/lib/validation";
import type { DifficultyLevel } from "@/types";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { DifficultySelect } from "./difficulty-select";
import { TenseSelect } from "./tense-select";

interface StartSessionFormProps {
  defaultDifficulty?: DifficultyLevel;
}

export function StartSessionForm({ defaultDifficulty }: StartSessionFormProps) {
  const form = useForm<StartSessionFormData>({
    resolver: standardSchemaResolver(startSessionSchema),
    defaultValues: {
      tense: undefined,
      difficulty: defaultDifficulty,
    },
  });

  const { mutate: createSession, isPending: isSubmitting } = useCreateSession();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createSession(data))} className="space-y-4 sm:space-y-6">
        <FormField
          control={form.control}
          name="tense"
          render={({ field }) => <TenseSelect value={field.value} onChange={field.onChange} disabled={isSubmitting} />}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <DifficultySelect value={field.value} onChange={field.onChange} disabled={isSubmitting} />
          )}
        />

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            Start Training
          </Button>
        </div>
      </form>
    </Form>
  );
}
