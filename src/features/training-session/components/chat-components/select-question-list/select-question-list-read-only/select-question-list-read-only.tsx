import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatLogWrapper } from "@/features/training-session/components/training-session/chat-log-wrapper";
import type { QuestionReview, QuestionWithoutAnswer } from "@/features/training/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { memo } from "react";

interface SelectQuestionListReadOnlyProps {
  questions: QuestionWithoutAnswer[];
  roundNumber: number;
  totalQuestions: number;
  questionsReview: QuestionReview[];
}

export const SelectQuestionListReadOnly = memo(function SelectQuestionListReadOnly({
  questions,
  roundNumber,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  totalQuestions,
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
          {questions.map((question) => {
            const review = getReviewForQuestion(question.id);
            const isCorrect = review?.is_correct ?? false;

            return (
              <div key={question.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">Question {question.question_number}</h3>
                  {review && (
                    <Badge variant={isCorrect ? "default" : "destructive"} className="gap-1">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Incorrect
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{question.question_text}</p>
                <div className="space-y-2">
                  {question.options.map((option, index) => {
                    const isUserAnswer = review && option === review.user_answer;
                    const isCorrectAnswer = review && option === review.correct_answer;

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-md border text-sm ${
                          isCorrectAnswer
                            ? "bg-green-50 dark:bg-green-950 border-green-500"
                            : isUserAnswer && !isCorrect
                            ? "bg-red-50 dark:bg-red-950 border-red-500"
                            : "bg-muted border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isCorrectAnswer && (
                            <Badge variant="outline" className="text-xs">
                              Correct Answer
                            </Badge>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <Badge variant="destructive" className="text-xs">
                              Your Answer
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </ChatLogWrapper>
  );
});
