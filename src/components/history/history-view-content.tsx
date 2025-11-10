import { Alert } from "@/components/auth/common/Alert";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { useHistorySessions } from "@/lib/hooks/use-history-sessions";
import { EmptyState } from "./empty-state";
import { HistoryList } from "./history-list";

export function HistoryViewContent() {
  const { sessions, isError, error } = useHistorySessions();

  if (isError) {
    return (
      <div role="alert" aria-live="assertive">
        <Alert variant="error">{error?.message || "Failed to load history. Please try again later."}</Alert>
      </div>
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
