import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import type { RoundSummaryElementProps } from "./types";

export const RoundSummaryElement = memo(function RoundSummaryElement({
  roundNumber,
  score,
  totalQuestions,
  feedback,
  onContinue,
  isLoading,
}: RoundSummaryElementProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isNextRound = roundNumber < 3;
  const buttonText = isNextRound ? `Start Round ${roundNumber + 1}` : "Finish Session";

  return (
    <Card id={`round-summary-${roundNumber}`} className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Round {roundNumber} Complete!</CardTitle>
          <Badge variant={percentage >= 70 ? "default" : "secondary"} className="text-lg px-4 py-1">
            {score}/{totalQuestions}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Accuracy</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {feedback && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Feedback</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </div>
        )}
        <Separator />
        <Button onClick={onContinue} disabled={isLoading} className="w-auto ml-auto" size="lg">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
});
