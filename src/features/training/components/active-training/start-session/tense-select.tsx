import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TenseName } from "@/types";

interface TenseSelectProps {
  value: TenseName | undefined;
  onChange: (value: TenseName) => void;
  disabled?: boolean;
}

const TENSE_OPTIONS: TenseName[] = ["Present Simple", "Past Simple", "Present Perfect", "Future Simple"];

export function TenseSelect({ value, onChange, disabled }: TenseSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tense-select">Select Tense</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="tense-select" className="w-full truncate" data-test-id="tense-select">
          <SelectValue placeholder="Choose a tense..." />
        </SelectTrigger>
        <SelectContent>
          {TENSE_OPTIONS.map((tense) => (
            <SelectItem
              key={tense}
              value={tense}
              data-test-id={`tense-option-${tense.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {tense}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
