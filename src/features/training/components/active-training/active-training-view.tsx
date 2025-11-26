import { withQueryClient } from "@/components/providers/with-query-client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useActiveTrainingViewData } from "../../hooks/use-active-training-view-data";
import { ActiveSessionsList } from "./list/active-sessions-list";
import { StartSessionCTA } from "./start-session/start-session-cta";

function ActiveTrainingViewContent() {
  const { sessions, defaultDifficulty } = useActiveTrainingViewData();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-y-auto">
        <ActiveSessionsList sessions={sessions} defaultDifficulty={defaultDifficulty} />
      </div>
      {sessions.length > 0 && <StartSessionCTA defaultDifficulty={defaultDifficulty} />}
    </div>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <p className="text-muted-foreground mb-2">Error loading active trainings</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  );
}

function ActiveTrainingViewFallback() {
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-y-auto">
        <div className="flex flex-col gap-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActiveTrainingView() {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <ErrorFallback error={error} />}>
      <Suspense fallback={<ActiveTrainingViewFallback />}>
        <ActiveTrainingViewContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export const ActiveTrainingViewWithQueryClient = withQueryClient(ActiveTrainingView);
