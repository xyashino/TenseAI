import type { QuestionCardBaseProps, QuestionWithoutAnswer } from "@/types";
import { memo } from "react";
import { QuestionHeader } from "./question-header";
import { QuestionOptions } from "./question-options";

interface QuestionCardProps extends QuestionCardBaseProps {
  question: QuestionWithoutAnswer;
  selectedAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  correctAnswer,
  isCorrect,
  roundNumber,
  totalQuestions,
}: QuestionCardProps) {
  const elementId = `round-${roundNumber}-question-${questionNumber}`;

  return (
    <div id={elementId} className="p-6 border rounded-lg bg-card space-y-4">
      <QuestionHeader
        questionText={question.question_text}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        isCorrect={isCorrect}
      />
      <QuestionOptions
        questionId={question.id}
        options={question.options}
        selectedAnswer={selectedAnswer}
        correctAnswer={correctAnswer}
        isCorrect={isCorrect}
      />
    </div>
  );
});
