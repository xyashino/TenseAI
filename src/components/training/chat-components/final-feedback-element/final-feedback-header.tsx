import { CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Trophy } from "lucide-react";
import { memo } from "react";

interface FinalFeedbackHeaderProps {
  perfectScore: boolean;
}

export const FinalFeedbackHeader = memo(function FinalFeedbackHeader({ perfectScore }: FinalFeedbackHeaderProps) {
  return (
    <CardHeader className="text-center space-y-4">
      <div className="flex justify-center">
        {perfectScore ? (
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
            <Trophy className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
          </div>
        ) : (
          <div className="p-4 bg-primary/10 rounded-full">
            <TrendingUp className="h-12 w-12 text-primary" />
          </div>
        )}
      </div>
      <div>
        <CardTitle className="text-2xl mb-2">Session Complete!</CardTitle>
        <p className="text-muted-foreground">
          {perfectScore ? "Perfect score! Outstanding work!" : "Great effort! Here's your performance summary."}
        </p>
      </div>
    </CardHeader>
  );
});
