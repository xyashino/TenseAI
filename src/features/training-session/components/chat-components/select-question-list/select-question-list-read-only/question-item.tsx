import type { QuestionReview, QuestionWithoutAnswer } from "@/features/training/types";
import { OptionItem } from "./option-item";
import { QuestionStatusBadge } from "./question-status-badge";

interface QuestionItemProps {
  question: QuestionWithoutAnswer;
  review?: QuestionReview;
}

export function QuestionItem({ question, review }: QuestionItemProps) {
  const isCorrect = review?.is_correct ?? false;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Question {question.question_number}</h3>
        {review && <QuestionStatusBadge isCorrect={isCorrect} />}
      </div>
      <p className="text-sm text-muted-foreground">{question.question_text}</p>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isUserAnswer = review ? option === review.user_answer : false;
          const isCorrectAnswer = review ? option === review.correct_answer : false;

          return (
            <OptionItem key={index} option={option} isUserAnswer={isUserAnswer} isCorrectAnswer={isCorrectAnswer} />
          );
        })}
      </div>
    </div>
  );
}
