import { ReportQuestionDialog } from "@/components/training/dialogs/report-question-dialog";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

interface QuestionHeaderProps {
  questionId: string;
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
  isAnswered: boolean;
}

export const QuestionHeader = memo(function QuestionHeader({
  questionId,
  questionText,
  questionNumber,
  totalQuestions,
  isAnswered,
}: QuestionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Question - {questionNumber} / {totalQuestions}
          </Badge>
          {isAnswered && (
            <Badge variant="default" className="text-xs">
              Answered
            </Badge>
          )}
        </div>
        <h3 className="text-base font-medium leading-relaxed">{questionText}</h3>
      </div>
      <ReportQuestionDialog questionId={questionId} questionText={questionText} />
    </div>
  );
});
