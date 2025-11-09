import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { memo } from "react";

interface ResultBadgeProps {
  isCorrect: boolean;
}

export const ResultBadge = memo(function ResultBadge({ isCorrect }: ResultBadgeProps) {
  return (
    <Badge
      variant={isCorrect ? "default" : "destructive"}
      className={cn("text-xs flex items-center gap-1", isCorrect && "bg-green-600")}
    >
      {isCorrect ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Correct
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3" />
          Incorrect
        </>
      )}
    </Badge>
  );
});
