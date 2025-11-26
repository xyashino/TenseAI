import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChatLogWrapper } from "@/features/training-session/components/training-session/chat-log-wrapper";
import { useTrainingSessionActions } from "@/features/training-session/hooks/use-training-session-actions";
import { getFormSchema } from "@/features/training-session/utils/question-schema";
import type { QuestionWithoutAnswer } from "@/features/training/types";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  const { completeRound, isCompletingRound } = useTrainingSessionActions();

  const formSchema = getFormSchema(questions, totalQuestions);
  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: questions.reduce((acc, question) => {
      acc[question.id] = "";
      return acc;
    }, {} as Record<string, string>),
  });

  const onSubmit = (data: FormSchema) => {
    const answersMap = new Map<string, string>();
    Object.entries(data).forEach(([questionId, answer]) => {
      answersMap.set(questionId, answer);
    });
    completeRound(answersMap);
  };

  return (
    <ChatLogWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Round {roundNumber} - Answer the Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {questions.map((question, index) => (
                <FormField
                  key={question.id}
                  control={form.control}
                  name={question.id}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Question {question.question_number || index + 1}
                      </FormLabel>
                      <p className="text-sm text-muted-foreground mb-4">{question.question_text}</p>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isCompletingRound}
                          className="space-y-3"
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                              <label
                                htmlFor={`${question.id}-${optionIndex}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isCompletingRound}>
                  {isCompletingRound ? "Submitting..." : "Submit Answers"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </ChatLogWrapper>
  );
});
