interface StatsGridProps {
  totalScore: string;
  accuracyPercentage: number;
}

export function StatsGrid({ totalScore, accuracyPercentage }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
        <span className="text-xs text-muted-foreground font-medium">Total Score</span>
        <span className="text-xl font-bold">{totalScore}</span>
      </div>
      <div className="flex flex-col p-3 rounded-lg bg-muted/30 border">
        <span className="text-xs text-muted-foreground font-medium">Accuracy</span>
        <span
          className={
            accuracyPercentage >= 80
              ? "text-xl font-bold text-green-600 dark:text-green-400"
              : accuracyPercentage >= 60
                ? "text-xl font-bold text-yellow-600 dark:text-yellow-400"
                : "text-xl font-bold text-red-600 dark:text-red-400"
          }
        >
          {accuracyPercentage}%
        </span>
      </div>
    </div>
  );
}
