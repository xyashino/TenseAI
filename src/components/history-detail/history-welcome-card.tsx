import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DifficultyLevel, SessionSummary, TenseName } from "@/types";
import { memo } from "react";

interface HistoryWelcomeCardProps {
  userName?: string | null;
  tense: TenseName;
  difficulty: DifficultyLevel;
  summary: SessionSummary;
}

function formatScoreTrend(roundsScores: number[]): string {
  return roundsScores.map((score) => `${score}/10`).join(" → ");
}

export const HistoryWelcomeCard = memo(function HistoryWelcomeCard({
  userName,
  tense,
  difficulty,
  summary,
}: HistoryWelcomeCardProps) {
  const displayName = userName || "there";
  const scoreTrend = formatScoreTrend(summary.rounds_scores);
  const totalScore = summary.rounds_scores.reduce((sum, score) => sum + score, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Review - Hello {displayName}!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Review your completed training session. See how you performed and learn from your mistakes!
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1">
            <span className="text-sm font-medium text-muted-foreground">Tense</span>
            <Badge className="w-fit">{tense}</Badge>
          </div>
          <div className="flex gap-1">
            <span className="text-sm font-medium text-muted-foreground">Difficulty</span>
            <Badge className="w-fit">{difficulty}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Total Score</p>
            <p className="text-lg font-semibold">
              {totalScore}/{summary.total_questions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Accuracy</p>
            <p className="text-lg font-semibold">{summary.accuracy_percentage}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Round Scores</p>
            <p className="text-sm font-semibold" aria-label={`Score trend: ${scoreTrend}`}>
              {scoreTrend}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">Performance Summary</p>
          <p className="text-sm text-muted-foreground">
            You answered <span className="font-semibold text-foreground">{summary.correct_answers}</span> out of{" "}
            <span className="font-semibold text-foreground">{summary.total_questions}</span> questions correctly across{" "}
            <span className="font-semibold text-foreground">{summary.rounds_scores.length}</span> rounds.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
