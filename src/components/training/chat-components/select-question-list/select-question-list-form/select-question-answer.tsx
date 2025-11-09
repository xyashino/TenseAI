import type { QuestionCardBaseProps, QuestionWithoutAnswer } from "@/types";
import { memo } from "react";
import { QuestionCard } from "./question-card";

interface SelectQuestionAnswerProps extends QuestionCardBaseProps {
  question: QuestionWithoutAnswer;
  value: string;
  onChange: (value: string) => void;
  focusId?: string;
  hasError?: boolean;
}

export const SelectQuestionAnswer = memo(function SelectQuestionAnswer({
  question,
  questionNumber,
  value,
  onChange,
  roundNumber,
  focusId,
  totalQuestions,
  hasError,
}: SelectQuestionAnswerProps) {
  return (
    <QuestionCard
      question={question}
      questionNumber={questionNumber}
      value={value}
      onChange={onChange}
      roundNumber={roundNumber}
      focusId={focusId}
      totalQuestions={totalQuestions}
      hasError={hasError}
    />
  );
});
