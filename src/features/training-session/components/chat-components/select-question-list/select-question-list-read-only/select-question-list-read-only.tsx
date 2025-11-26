import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatLogWrapper } from "@/features/training-session/components/training-session/chat-log-wrapper";
import type { QuestionReview, QuestionWithoutAnswer } from "@/features/training/types";
import { memo } from "react";
import { QuestionItem } from "./question-item";

interface SelectQuestionListReadOnlyProps {
  questions: QuestionWithoutAnswer[];
  roundNumber: number;
  totalQuestions: number;
  questionsReview: QuestionReview[];
}

export const SelectQuestionListReadOnly = memo(function SelectQuestionListReadOnly({
  questions,
  roundNumber,
  questionsReview,
}: SelectQuestionListReadOnlyProps) {
  const getReviewForQuestion = (questionId: string): QuestionReview | undefined => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return undefined;
    return questionsReview.find((review) => review.question_number === question.question_number);
  };

  return (
    <ChatLogWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Round {roundNumber} - Questions Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question) => (
            <QuestionItem key={question.id} question={question} review={getReviewForQuestion(question.id)} />
          ))}
        </CardContent>
      </Card>
    </ChatLogWrapper>
  );
});
