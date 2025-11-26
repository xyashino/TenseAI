import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

interface OptionItemProps {
  option: string;
  isUserAnswer: boolean;
  isCorrectAnswer: boolean;
}

export function OptionItem({ option, isUserAnswer, isCorrectAnswer }: OptionItemProps) {
  const isUserIncorrect = isUserAnswer && !isCorrectAnswer;

  return (
    <div
      className={cn(
        "p-3 rounded-md border text-sm",
        isCorrectAnswer
          ? "bg-green-50 dark:bg-green-950 border-green-500"
          : isUserIncorrect
          ? "bg-red-50 dark:bg-red-950 border-red-500"
          : "bg-muted border-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <span>{option}</span>
        <div className="flex items-center gap-2">
          {isCorrectAnswer && (
            <Badge variant="outline" className="text-xs">
              Correct Answer
            </Badge>
          )}
          {isUserAnswer && (
            <Badge variant={isCorrectAnswer ? "outline" : "destructive"} className="text-xs">
              Your Answer
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
