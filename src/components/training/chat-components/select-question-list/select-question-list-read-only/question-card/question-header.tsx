import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import { ResultBadge } from "./result-badge";

interface QuestionHeaderProps {
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
  isCorrect?: boolean;
}

export const QuestionHeader = memo(function QuestionHeader({
  questionText,
  questionNumber,
  totalQuestions,
  isCorrect,
}: QuestionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Question - {questionNumber} / {totalQuestions}
          </Badge>
          {isCorrect !== undefined && <ResultBadge isCorrect={isCorrect} />}
        </div>
        <h3 className="text-base font-medium leading-relaxed">{questionText}</h3>
      </div>
    </div>
  );
});
