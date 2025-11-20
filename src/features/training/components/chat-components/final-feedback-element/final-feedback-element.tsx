import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChatLogWrapper } from "@/features/training/components/training-session/chat-log-wrapper";
import { DetailedAnalysis } from "./detailed-analysis";
import { FinalFeedbackActions } from "./final-feedback-actions";
import { FinalFeedbackHeader } from "./final-feedback-header";
import { RoundsScoresDisplay } from "./rounds-scores-display";
import { StatsGrid } from "./stats-grid";

export interface FinalFeedbackElementProps {
  roundsScores: number[];
  totalScore: string;
  accuracyPercentage: number;
  perfectScore: boolean;
  finalFeedback: string;
}

export function FinalFeedbackElement({
  roundsScores,
  totalScore,
  accuracyPercentage,
  perfectScore,
  finalFeedback,
}: FinalFeedbackElementProps) {
  return (
    <ChatLogWrapper>
      <Card className="w-full bg-card">
        <FinalFeedbackHeader perfectScore={perfectScore} />
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Performance Summary</h4>
            <RoundsScoresDisplay roundsScores={roundsScores} />
            <StatsGrid totalScore={totalScore} accuracyPercentage={accuracyPercentage} />
          </div>

          <Separator />

          <DetailedAnalysis finalFeedback={finalFeedback} />

          <Separator />

          <FinalFeedbackActions />
        </CardContent>
      </Card>
    </ChatLogWrapper>
  );
}
