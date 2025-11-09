import { Badge } from "@/components/ui/badge";
import { memo } from "react";

interface RoundsScoresDisplayProps {
  roundsScores: number[];
}

export const RoundsScoresDisplay = memo(function RoundsScoresDisplay({ roundsScores }: RoundsScoresDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {roundsScores.map((score, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="text-center">
            <Badge variant="outline" className="mb-1">
              Round {index + 1}
            </Badge>
            <div className="text-2xl font-bold">{score}/10</div>
          </div>
          {index < roundsScores.length - 1 && <div className="text-muted-foreground text-2xl">→</div>}
        </div>
      ))}
    </div>
  );
});
