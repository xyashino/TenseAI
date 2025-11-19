import { NavigationRoutes } from "@/lib/enums/navigation";
import { useHistorySessions } from "../hooks/use-history-sessions";
import { EmptyState } from "./empty-state";
import { HistoryList } from "./history-list";

export function HistoryViewContent() {
  const { sessions } = useHistorySessions();

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No completed sessions"
        description="You haven't completed any training sessions yet. Start practicing to see your history here."
        ctaText="Start Practicing"
        ctaLink={NavigationRoutes.TRAINING}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <HistoryList sessions={sessions} />
    </div>
  );
}
