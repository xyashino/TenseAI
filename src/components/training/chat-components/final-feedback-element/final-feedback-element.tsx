import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { memo } from "react";
import type { FinalFeedbackElementProps } from "../types";
import { DetailedAnalysis } from "./detailed-analysis";
import { FinalFeedbackActions } from "./final-feedback-actions";
import { FinalFeedbackHeader } from "./final-feedback-header";
import { RoundsScoresDisplay } from "./rounds-scores-display";
import { StatsGrid } from "./stats-grid";

export const FinalFeedbackElement = memo(function FinalFeedbackElement({
  roundsScores,
  totalScore,
  accuracyPercentage,
  perfectScore,
  finalFeedback,
  onViewHistory,
  onStartNewSession,
}: FinalFeedbackElementProps) {
  return (
    <Card className="border-2 border-primary">
      <FinalFeedbackHeader perfectScore={perfectScore} />

      <CardContent className="space-y-6">
        <RoundsScoresDisplay roundsScores={roundsScores} />

        <Separator />

        <StatsGrid totalScore={totalScore} accuracyPercentage={accuracyPercentage} />

        <Separator />

        {finalFeedback && <DetailedAnalysis finalFeedback={finalFeedback} />}

        <FinalFeedbackActions onViewHistory={onViewHistory} onStartNewSession={onStartNewSession} />
      </CardContent>
    </Card>
  );
});
