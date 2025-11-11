import { Form, FormField } from "@/components/ui/form";
import { useTrainingSessionActions } from "@/lib/hooks/use-training-session-actions";
import type { QuestionWithoutAnswer } from "@/types";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { memo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectQuestionWrapper } from "../common/select-question-wrapper";
import { SelectQuestionAnswer } from "./select-question-answer";
import { QuestionSubmit } from "./select-question-submit";
import { getFormSchema } from "@/lib/utils";

interface SelectQuestionFormProps {
  questions: QuestionWithoutAnswer[];
  roundNumber: number;
  totalQuestions: number;
}

export const SelectQuestionForm = memo(function SelectQuestionForm({
  questions,
  roundNumber,
  totalQuestions,
}: SelectQuestionFormProps) {
  const { completeRound } = useTrainingSessionActions();

  const formSchema = getFormSchema(questions, totalQuestions);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: questions.reduce((acc, question) => {
      acc[question.id] = "";
      return acc;
    }, {} as FormValues),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const answersMap = new Map<string, string>(
        Object.entries(data).map(([question_id, selected_answer]) => [question_id, selected_answer as string])
      );
      await completeRound(answersMap);
    } catch {
      toast.error("Failed to submit answers");
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const formValues = form.watch();
  const answeredCount = Object.values(formValues).filter((value) => value !== "").length;
  const hasError = Object.keys(form.formState.errors).length > 0;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-2">
        <SelectQuestionWrapper roundNumber={roundNumber} roundId={`round-${roundNumber}`}>
          {questions.map((question, index) => {
            return (
              <FormField
                key={question.id}
                control={form.control}
                name={question.id}
                render={({ field, fieldState }) => (
                  <SelectQuestionAnswer
                    value={field.value}
                    onChange={field.onChange}
                    question={question}
                    questionNumber={index + 1}
                    roundNumber={roundNumber}
                    totalQuestions={totalQuestions}
                    hasError={!!fieldState.error}
                  />
                )}
              />
            );
          })}
        </SelectQuestionWrapper>

        <QuestionSubmit
          roundNumber={roundNumber}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          hasError={hasError}
        />
      </form>
    </Form>
  );
});
