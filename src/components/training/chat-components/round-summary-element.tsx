import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTrainingSessionActions } from "@/lib/hooks/use-training-session-actions";
import type { QuestionReview } from "@/types";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { ChatLogWrapper } from "../chat-log-wrapper";

export interface RoundSummaryElementProps {
  roundNumber: number;
  score: number;
  totalQuestions: number;
  feedback: string;
  questionsReview: QuestionReview[];
  onContinue?: () => Promise<void>;
  isLoading: boolean;
  isReadOnly?: boolean;
}

export const RoundSummaryElement = memo(function RoundSummaryElement({
  roundNumber,
  score,
  totalQuestions,
  feedback,
  isLoading: isLoadingProp,
  isReadOnly = false,
}: RoundSummaryElementProps) {
  const { startRound, completeSession, isLoadingRound, isCompletingSession } = useTrainingSessionActions();

  const percentage = Math.round((score / totalQuestions) * 100);
  const isNextRound = roundNumber < 3;
  const buttonText = isNextRound ? `Start Round ${roundNumber + 1}` : "Finish Session";
  const isLoading = isLoadingProp || isLoadingRound || isCompletingSession;

  const handleContinue = async () => {
    if (isNextRound) {
      await startRound();
    } else {
      await completeSession();
    }
  };

  return (
    <ChatLogWrapper>
      <Card id={`round-summary-${roundNumber}`}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl">Round {roundNumber} Complete!</CardTitle>
            <Badge
              variant={percentage >= 70 ? "default" : "secondary"}
              className="text-base sm:text-lg px-3 sm:px-4 py-1 shrink-0"
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
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-semibold">Feedback</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            </div>
          )}
          {!isReadOnly && (
            <>
              <Separator />
              <Button onClick={handleContinue} disabled={isLoading} className="w-full" size="lg">
                {buttonText}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </ChatLogWrapper>
  );
});
