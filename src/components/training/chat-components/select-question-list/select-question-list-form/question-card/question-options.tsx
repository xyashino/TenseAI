import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getOptionId } from "@/lib/utils";
import { memo } from "react";

interface QuestionOptionsProps {
  questionId: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
}

export const QuestionOptions = memo(function QuestionOptions({
  questionId,
  options,
  value,
  onValueChange,
}: QuestionOptionsProps) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange}>
      {options.map((option, index) => {
        const optionId = getOptionId(questionId, index);
        return (
          <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors">
            <RadioGroupItem value={option} id={optionId} />
            <Label htmlFor={optionId} className="flex-1 cursor-pointer text-sm font-normal">
              {option}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
});
