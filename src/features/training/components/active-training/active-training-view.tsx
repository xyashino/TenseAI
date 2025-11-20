import { withQueryClient } from "@/components/providers/with-query-client";
import { useProfile } from "@/features/account";
import { Suspense } from "react";
import { useActiveTrainings } from "../../hooks/use-active-trainings";
import { ActiveSessionsList } from "./list/active-sessions-list";
import { StartSessionCTA } from "./start-session/start-session-cta";

export function ActiveTrainingViewContent() {
  const { data: trainingsData, isLoading, isError, error } = useActiveTrainings();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  if (isLoading || isLoadingProfile) {
    return <ActiveTrainingViewFallback />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-muted-foreground mb-2">Error loading active trainings</p>
        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
      </div>
    );
  }

  const sessions = trainingsData?.["training-sessions"] || [];
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-y-auto">
        <ActiveSessionsList sessions={sessions} defaultDifficulty={profile?.default_difficulty} />
      </div>
      {sessions.length > 0 && <StartSessionCTA defaultDifficulty={profile?.default_difficulty} />}
    </div>
  );
}

function ActiveTrainingViewFallback() {
  return (
    <div className="flex flex-col gap-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function ActiveTrainingView() {
  return <ActiveTrainingViewContent />;
}

export const ActiveTrainingViewWithQueryClient = withQueryClient(ActiveTrainingView);
