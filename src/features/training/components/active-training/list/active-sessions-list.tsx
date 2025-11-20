import type { DifficultyLevel } from "@/types";
import type { TrainingSessionWithRounds } from "@/features/training/types";
import { ActiveSessionCard } from "../session-card/active-session-card";
import { EmptyState } from "./empty-state";

interface ActiveSessionsListProps {
  sessions: TrainingSessionWithRounds[];
  defaultDifficulty?: DifficultyLevel;
}

export function ActiveSessionsList({ sessions, defaultDifficulty }: ActiveSessionsListProps) {
  if (sessions.length === 0) {
    return <EmptyState defaultDifficulty={defaultDifficulty} />;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <ActiveSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
