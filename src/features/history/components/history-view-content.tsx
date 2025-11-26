import { NavigationRoutes } from "@/shared/enums/navigation";
import { useHistorySessions } from "../hooks/use-history-sessions";
import { EmptyState } from "./empty-state";
import { HistoryList } from "./history-list";
import { HistoryViewFallback } from "./history-view-fallback";

export function HistoryViewContent() {
  const { sessions, isLoading, isError, error } = useHistorySessions();

  if (isLoading) {
    return <HistoryViewFallback />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Error loading history"
        description={error instanceof Error ? error.message : "We couldn't load your training history. Please try again later."}
        ctaText="Go to Practice"
        ctaLink={NavigationRoutes.TRAINING}
      />
    );
  }

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
