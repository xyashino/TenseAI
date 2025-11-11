import { DeleteConfirmDialog } from "@/components/active-training/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateSessionProgress } from "@/lib/utils/session-progress";
import type { TrainingSessionWithRounds } from "@/types";
import { Play } from "lucide-react";
import { SessionInfo } from "./session-info";

interface ActiveSessionCardProps {
  session: TrainingSessionWithRounds;
}

export function ActiveSessionCard({ session }: ActiveSessionCardProps) {
  const progress = calculateSessionProgress(session.rounds);
  const startedDate = new Date(session.started_at).toISOString().split("T")[0];

  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-grow w-full">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <SessionInfo tense={session.tense} difficulty={session.difficulty} />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-x-4 gap-y-1 flex-wrap">
            <p>Progress: {progress.progressPercentage}%</p>
            <p>Started: {startedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button className="flex flex-grow lg:flex-none items-center gap-2" asChild>
            <a href={`/app/training/${session.id}`}>
              <Play className="h-4 w-4" />
              Continue
            </a>
          </Button>
          <DeleteConfirmDialog sessionId={session.id} />
        </div>
      </CardContent>
    </Card>
  );
}
