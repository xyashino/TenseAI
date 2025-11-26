import { Button } from "@/components/ui/button";
import type { DifficultyLevel } from "@/types";
import { FileQuestion, Plus } from "lucide-react";
import { StartSessionDialog } from "../start-session/start-session-dialog";

interface EmptyStateProps {
  defaultDifficulty?: DifficultyLevel;
}

export function EmptyState({ defaultDifficulty }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      <FileQuestion className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
      <h3 className="text-base sm:text-lg font-semibold mb-2">No Active Trainings</h3>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-6">
        You haven&apos;t started any trainings yet. Click button to begin!
      </p>
      <StartSessionDialog
        defaultDifficulty={defaultDifficulty}
        trigger={
          <Button className="w-full sm:w-auto" data-test-id="start-new-training-button">
            <Plus className="h-4 w-4" />
            Start new training
          </Button>
        }
      />
    </div>
  );
}
