import { Form, FormField } from "@/components/ui/form";
import { useTrainingSessionActions } from "@/lib/hooks/use-training-session-actions";
import { scrollToElement } from "@/lib/utils";
import type { QuestionWithoutAnswer } from "@/types";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectQuestionWrapper } from "../select-question-wrapper";
import { SelectQuestionAnswer } from "./select-question-answer";
import { QuestionSubmit } from "./select-question-submit";
import { getFormSchema } from "./utils";

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

  useEffect(() => {
    if (!form.formState.isSubmitted) return;
    const errors = form.formState.errors;
    if (Object.keys(errors).length === 0) return;

    const firstErrorQuestion = questions.find((q) => errors[q.id as keyof typeof errors]);
    if (!firstErrorQuestion) return;

    const firstErrorQuestionIndex = questions.findIndex((q) => q.id === firstErrorQuestion.id);
    const firstErrorElementId = `round-${roundNumber}-question-${firstErrorQuestionIndex + 1}`;

    scrollToElement(firstErrorElementId);
  }, [form.formState.errors, form.formState.isSubmitted, questions, roundNumber]);

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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-2">
        <SelectQuestionWrapper roundNumber={roundNumber} roundId={`round-${roundNumber}`}>
          {questions.map((question, index) => {
            const isLastQuestion = index + 1 === totalQuestions;
            const focusId = isLastQuestion ? undefined : `round-${roundNumber}-question-${index + 2}`;
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
                    focusId={focusId}
                    totalQuestions={totalQuestions}
                    hasError={!!fieldState.error}
                  />
                )}
              />
            );
          })}
        </SelectQuestionWrapper>

        <QuestionSubmit roundNumber={roundNumber} />
      </form>
    </Form>
  );
});
