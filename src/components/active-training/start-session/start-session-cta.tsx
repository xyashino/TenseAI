import { Button } from "@/components/ui/button";
import type { DifficultyLevel } from "@/types";
import { StartSessionDialog } from "./start-session-dialog";

interface StartSessionCTAProps {
  defaultDifficulty?: DifficultyLevel;
}

export function StartSessionCTA({ defaultDifficulty }: StartSessionCTAProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-md font-medium text-foreground">Need more practice?</p>
      <StartSessionDialog
        defaultDifficulty={defaultDifficulty}
        trigger={
          <Button variant="link" className="">
            Start new training
          </Button>
        }
      />
    </div>
  );
}
