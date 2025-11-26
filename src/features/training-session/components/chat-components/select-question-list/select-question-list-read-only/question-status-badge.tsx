import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionStatusBadgeProps {
  isCorrect: boolean;
}

export function QuestionStatusBadge({ isCorrect }: QuestionStatusBadgeProps) {
  return (
    <Badge variant={isCorrect ? "default" : "destructive"} className="gap-1">
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
}
