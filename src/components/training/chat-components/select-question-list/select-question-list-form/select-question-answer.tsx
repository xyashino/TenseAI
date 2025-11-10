import type { QuestionCardBaseProps, QuestionWithoutAnswer } from "@/types";
import { memo } from "react";
import { QuestionCard } from "../common";

interface SelectQuestionAnswerProps extends QuestionCardBaseProps {
  question: QuestionWithoutAnswer;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export const SelectQuestionAnswer = memo(function SelectQuestionAnswer({
  question,
  questionNumber,
  value,
  onChange,
  roundNumber,
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
      totalQuestions={totalQuestions}
      hasError={hasError}
    />
  );
});
