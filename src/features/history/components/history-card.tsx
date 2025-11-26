import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TrainingSessionWithRounds } from "@/features/training/types";
import { NavigationRoutes } from "@/shared/enums/navigation";
import type { TenseName } from "@/types";
import { ArrowRight, Award, History, Sparkles, Target } from "lucide-react";
import type React from "react";

interface HistoryCardProps {
  session: TrainingSessionWithRounds;
}

function getTenseIconComponent(tense: TenseName) {
  const iconMap: Record<TenseName, React.ComponentType<{ className?: string }>> = {
    "Present Simple": Target,
    "Past Simple": History,
    "Present Perfect": Award,
    "Future Simple": Sparkles,
  };

  const IconComponent = iconMap[tense];
  return <IconComponent className="size-6 sm:size-7 text-muted-foreground" />;
}

function formatCompletedDate(completedAt: string | null): string {
  if (!completedAt) return "";
  return new Date(completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getScoreTrend(rounds: TrainingSessionWithRounds["rounds"]): string {
  if (!Array.isArray(rounds) || rounds.length === 0) {
    return "—";
  }

  const sortedRounds = [...rounds].sort((a, b) => (a?.round_number || 0) - (b?.round_number || 0));
  const scoreTrend = sortedRounds
    .map((round) => {
      if (round?.score === null || round?.score === undefined) {
        return "—";
      }
      return `${round.score}/10`;
    })
    .join(" → ");

  return scoreTrend || "—";
}

export function HistoryCard({ session }: HistoryCardProps) {
  const tenseIcon = getTenseIconComponent(session.tense);
  const completedAt = formatCompletedDate(session.completed_at);
  const scoreTrend = getScoreTrend(session.rounds);
  const detailPageUrl = `${NavigationRoutes.HISTORY}/${session.id}`;

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0" aria-hidden="true">
              {tenseIcon}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg truncate">{session.tense}</h3>
              <Badge variant="secondary" className="mt-1 capitalize">
                {session.difficulty}
              </Badge>
            </div>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <time
              dateTime={session.completed_at || undefined}
              className="text-xs sm:text-sm text-muted-foreground block"
            >
              {completedAt}
            </time>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">Scores:</span>{" "}
            <span aria-label={`Score trend: ${scoreTrend}`}>{scoreTrend}</span>
          </p>
          <Button
            asChild
            variant="link"
            size="sm"
            className="gap-1"
            aria-label={`View details for ${session.tense} session completed on ${completedAt}`}
          >
            <a href={detailPageUrl}>
              View Details
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
