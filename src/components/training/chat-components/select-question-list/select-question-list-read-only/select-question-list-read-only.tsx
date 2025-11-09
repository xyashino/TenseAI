import type { QuestionReview, QuestionWithoutAnswer } from "@/types";
import { SelectQuestionWrapper } from "../select-question-wrapper";
import { SelectQuestionAnswerReadOnly } from "./select-question-answer-read-only";

interface SelectQuestionListReadOnlyProps {
  questions: QuestionWithoutAnswer[];
  roundNumber: number;
  totalQuestions: number;
  answers?: Map<string, string> | Record<string, string>;
  questionsReview?: QuestionReview[];
}

export function SelectQuestionListReadOnly({
  questions,
  roundNumber,
  totalQuestions,
  answers,
  questionsReview,
}: SelectQuestionListReadOnlyProps) {
  const answersMap = answers instanceof Map ? answers : new Map(Object.entries(answers || {}));

  const reviewMap = new Map<string, QuestionReview>();
  if (questionsReview) {
    questionsReview.forEach((review) => {
      reviewMap.set(review.question_text, review);
    });
  }

  return (
    <SelectQuestionWrapper roundNumber={roundNumber} roundId={`round-${roundNumber}`}>
      {questions.map((question, index) => {
        const selectedAnswer = answersMap.get(question.id);
        const review = reviewMap.get(question.question_text);
        return (
          <SelectQuestionAnswerReadOnly
            key={question.id}
            question={question}
            questionNumber={index + 1}
            selectedAnswer={selectedAnswer || review?.user_answer}
            correctAnswer={review?.correct_answer}
            isCorrect={review?.is_correct}
            roundNumber={roundNumber}
            totalQuestions={totalQuestions}
          />
        );
      })}
    </SelectQuestionWrapper>
  );
}
