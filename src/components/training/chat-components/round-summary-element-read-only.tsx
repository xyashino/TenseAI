import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuestionReview } from "@/types";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { ChatLogWrapper } from "../chat-log-wrapper";

export interface RoundSummaryElementReadOnlyProps {
  roundNumber: number;
  score: number;
  totalQuestions: number;
  feedback: string;
  questionsReview: QuestionReview[];
}

export const RoundSummaryElementReadOnly = memo(function RoundSummaryElementReadOnly({
  roundNumber,
  score,
  totalQuestions,
  feedback,
}: RoundSummaryElementReadOnlyProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <ChatLogWrapper>
      <Card id={`round-summary-${roundNumber}`} data-test-id={`round-summary-${roundNumber}`}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl">Round {roundNumber} Complete!</CardTitle>
            <Badge
              variant={percentage >= 70 ? "default" : "secondary"}
              className="text-base sm:text-lg px-3 sm:px-4 py-1 shrink-0"
              data-test-id={`round-summary-score-${roundNumber}`}
            >
              {score}/{totalQuestions}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Accuracy</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          {feedback && (
            <div className="space-y-2" data-test-id={`round-summary-feedback-${roundNumber}`}>
              <h4 className="text-xs sm:text-sm font-semibold">Feedback</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ChatLogWrapper>
  );
});
