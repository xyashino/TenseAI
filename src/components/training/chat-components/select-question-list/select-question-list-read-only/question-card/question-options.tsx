import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, getOptionId } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { memo } from "react";

interface QuestionOptionsProps {
  questionId: string;
  options: string[];
  selectedAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

export const QuestionOptions = memo(function QuestionOptions({
  questionId,
  options,
  selectedAnswer,
  correctAnswer,
  isCorrect,
}: QuestionOptionsProps) {
  const hasReview = correctAnswer !== undefined && isCorrect !== undefined;

  return (
    <RadioGroup value={selectedAnswer || ""} disabled>
      {options.map((option, index) => {
        const isSelected = option === selectedAnswer;
        const isCorrectOption = option === correctAnswer;
        const showAsCorrect = hasReview && isCorrectOption;
        const showAsIncorrect = hasReview && isSelected && !isCorrect;
        const optionId = getOptionId(questionId, index);

        return (
          <div
            key={index}
            className={cn(
              "flex items-center space-x-3 p-2 rounded-md transition-colors",
              showAsCorrect && "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800",
              showAsIncorrect && "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800",
              !hasReview && "hover:bg-accent"
            )}
          >
            <RadioGroupItem value={option} id={optionId} />
            <Label
              htmlFor={optionId}
              className={cn(
                "flex-1 cursor-default text-sm font-normal flex items-center gap-2",
                showAsCorrect && "text-green-700 dark:text-green-400",
                showAsIncorrect && "text-red-700 dark:text-red-400"
              )}
            >
              {option}
              {showAsCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
              {showAsIncorrect && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
});
