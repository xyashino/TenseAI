import { useProfile } from "@/lib/hooks/use-profile";
import { useActiveTrainings } from "@/lib/hooks/use-trainings-sessions";
import { Suspense } from "react";
import { ActiveSessionsList } from "./list/active-sessions-list";
import { StartSessionCTA } from "./start-session/start-session-cta";

function ActiveTrainingViewContent() {
  const { data: trainingsData } = useActiveTrainings();
  const { data: profile } = useProfile();

  const sessions = trainingsData["training-sessions"] || [];
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-y-auto">
        <ActiveSessionsList sessions={sessions} defaultDifficulty={profile?.default_difficulty} />
      </div>
      {sessions.length > 0 && <StartSessionCTA defaultDifficulty={profile.default_difficulty} />}
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

export function ActiveTrainingView() {
  return (
    <div className="h-full">
      <Suspense fallback={<ActiveTrainingViewFallback />}>
        <ActiveTrainingViewContent />
      </Suspense>
    </div>
  );
}
