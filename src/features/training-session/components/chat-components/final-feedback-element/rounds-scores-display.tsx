import { cn } from "@/shared/utils/cn";

interface RoundsScoresDisplayProps {
  roundsScores: number[];
}

export function RoundsScoresDisplay({ roundsScores }: RoundsScoresDisplayProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {roundsScores.map((score, index) => (
        <div
          key={index}
          className={cn(
            "flex flex-col items-center justify-center px-4 py-2 rounded-lg border",
            score === 10 // Assuming 10 questions per round
              ? "bg-primary/10 border-primary/20"
              : "bg-muted/50 border-transparent"
          )}
        >
          <span className="text-xs text-muted-foreground font-medium">Round {index + 1}</span>
          <span className="text-lg font-bold">{score}/10</span>
        </div>
      ))}
    </div>
  );
}
