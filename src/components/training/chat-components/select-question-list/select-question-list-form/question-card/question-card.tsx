import { scrollToElement } from "@/lib/utils";
import type { QuestionWithoutAnswer, QuestionCardBaseProps } from "@/types";
import { memo, useCallback } from "react";
import { FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { QuestionHeader } from "./question-header";
import { QuestionOptions } from "./question-options";

interface QuestionCardProps extends QuestionCardBaseProps {
  question: QuestionWithoutAnswer;
  value: string;
  onChange: (value: string) => void;
  focusId?: string;
  hasError?: boolean;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  questionNumber,
  value,
  onChange,
  roundNumber,
  focusId,
  totalQuestions,
  hasError,
}: QuestionCardProps) {
  const elementId = `round-${roundNumber}-question-${questionNumber}`;

  const handleValueChange = useCallback(
    (newValue: string) => {
      const previousValueWasEmpty = value === "";
      onChange(newValue);
      if (previousValueWasEmpty && focusId) {
        scrollToElement(focusId);
      }
    },
    [onChange, focusId, value]
  );

  return (
    <div
      id={elementId}
      className={cn(
        "p-6 border rounded-lg bg-card space-y-4 transition-colors",
        hasError && "border-destructive border-2 bg-destructive/5"
      )}
    >
      <QuestionHeader
        questionId={question.id}
        questionText={question.question_text}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        isAnswered={!!value}
      />
      <QuestionOptions
        questionId={question.id}
        options={question.options}
        value={value}
        onValueChange={handleValueChange}
      />
      <FormMessage />
    </div>
  );
});
