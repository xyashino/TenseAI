import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DifficultyLevel } from "@/types";

interface DifficultySelectProps {
  value: DifficultyLevel | undefined;
  onChange: (value: DifficultyLevel) => void;
  defaultValue?: DifficultyLevel;
  disabled?: boolean;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; description: string }[] = [
  {
    value: "Basic",
    label: "Basic",
    description: "A2/B1 vocabulary level",
  },
  {
    value: "Advanced",
    label: "Advanced",
    description: "B2 vocabulary level",
  },
];

export function DifficultySelect({ value, onChange, defaultValue, disabled }: DifficultySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="difficulty-select">Select Difficulty</Label>
      <Select value={value} onValueChange={onChange} defaultValue={defaultValue} disabled={disabled}>
        <SelectTrigger id="difficulty-select" className="w-full truncate" data-test-id="difficulty-select">
          <SelectValue placeholder="Choose difficulty..." />
        </SelectTrigger>
        <SelectContent>
          {DIFFICULTY_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              data-test-id={`difficulty-option-${option.value.toLowerCase()}`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-muted-foreground text-sm ml-2">({option.description})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
