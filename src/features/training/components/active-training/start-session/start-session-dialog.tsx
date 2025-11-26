import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DifficultyLevel } from "@/types";
import { StartSessionForm } from "./start-session-form";

interface StartSessionDialogProps {
  defaultDifficulty?: DifficultyLevel;
  trigger: React.ReactNode;
}

export function StartSessionDialog({ defaultDifficulty, trigger }: StartSessionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-test-id="start-training-dialog">
        <DialogHeader>
          <DialogTitle data-test-id="start-training-dialog-title">Start New Training</DialogTitle>
          <DialogDescription>Select a tense and difficulty level to begin your training.</DialogDescription>
        </DialogHeader>
        <StartSessionForm defaultDifficulty={defaultDifficulty} />
      </DialogContent>
    </Dialog>
  );
}
