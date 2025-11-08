import { Badge } from "@/components/ui/badge";
import type { DifficultyLevel, TenseName } from "@/types";

interface SessionInfoProps {
  tense: TenseName;
  difficulty: DifficultyLevel;
}

export function SessionInfo({ tense, difficulty }: SessionInfoProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-lg font-semibold">{tense}</h3>
      <Badge variant={difficulty === "Advanced" ? "default" : "secondary"}>{difficulty}</Badge>
    </div>
  );
}
