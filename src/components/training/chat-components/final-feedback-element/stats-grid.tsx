import { memo } from "react";

interface StatsGridProps {
  totalScore: string;
  accuracyPercentage: number;
}

export const StatsGrid = memo(function StatsGrid({ totalScore, accuracyPercentage }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Total Score</div>
        <div className="text-2xl font-bold">{totalScore}</div>
      </div>
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
        <div className="text-2xl font-bold">{accuracyPercentage}%</div>
      </div>
    </div>
  );
});
