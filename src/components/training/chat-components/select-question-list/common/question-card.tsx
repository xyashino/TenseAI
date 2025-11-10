import { cn } from "@/lib/utils";
import type { QuestionCardBaseProps, QuestionWithoutAnswer } from "@/types";
import { memo } from "react";
import { QuestionHeader } from "./question-header";
import { QuestionOptions } from "./question-options";

interface QuestionCardFormProps extends QuestionCardBaseProps {
  question: QuestionWithoutAnswer;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

interface QuestionCardReadOnlyProps extends QuestionCardBaseProps {
  question: QuestionWithoutAnswer;
  selectedAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

type QuestionCardProps = QuestionCardFormProps | QuestionCardReadOnlyProps;

function isFormMode(props: QuestionCardProps): props is QuestionCardFormProps {
  return "onChange" in props;
}

export const QuestionCard = memo(function QuestionCard(props: QuestionCardProps) {
  const { question, questionNumber, roundNumber, totalQuestions } = props;
  const elementId = `round-${roundNumber}-question-${questionNumber}`;

  if (isFormMode(props)) {
    const { value, onChange, hasError } = props;
    return (
      <div
        id={elementId}
        className={cn(
          "p-6 border-2 rounded-lg bg-card space-y-4 transition-colors",
          hasError && "border-destructive bg-destructive/5"
        )}
      >
        <QuestionHeader
          questionId={question.id}
          questionText={question.question_text}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          isAnswered={!!value}
        />
        <QuestionOptions questionId={question.id} options={question.options} value={value} onValueChange={onChange} />
      </div>
    );
  }

  const { selectedAnswer, correctAnswer, isCorrect } = props;
  return (
    <div id={elementId} className="p-6 border-2 rounded-lg bg-card space-y-4">
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
