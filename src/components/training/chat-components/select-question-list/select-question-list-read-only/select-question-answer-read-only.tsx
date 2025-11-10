import type { QuestionCardBaseProps, QuestionWithoutAnswer } from "@/types";
import { memo } from "react";
import { QuestionCard } from "../common";

interface SelectQuestionAnswerReadOnlyProps extends QuestionCardBaseProps {
  question: QuestionWithoutAnswer;
  selectedAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

export const SelectQuestionAnswerReadOnly = memo(function SelectQuestionAnswerReadOnly({
  question,
  questionNumber,
  selectedAnswer,
  correctAnswer,
  isCorrect,
  roundNumber,
  totalQuestions,
}: SelectQuestionAnswerReadOnlyProps) {
  return (
    <QuestionCard
      question={question}
      questionNumber={questionNumber}
      selectedAnswer={selectedAnswer}
      correctAnswer={correctAnswer}
      isCorrect={isCorrect}
      roundNumber={roundNumber}
      totalQuestions={totalQuestions}
    />
  );
});
