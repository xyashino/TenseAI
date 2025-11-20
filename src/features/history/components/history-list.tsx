import type { TrainingSessionWithRounds } from "@/features/training/types";
import { HistoryCard } from "./history-card";

interface HistoryListProps {
  sessions: TrainingSessionWithRounds[];
}

export function HistoryList({ sessions }: HistoryListProps) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-4" aria-label="Completed training sessions">
      {sessions.map((session) => (
        <li key={session.id}>
          <HistoryCard session={session} />
        </li>
      ))}
    </ul>
  );
}
