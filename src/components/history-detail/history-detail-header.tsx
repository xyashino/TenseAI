import { Button } from "@/components/ui/button";
import { NavigationRoutes } from "@/lib/enums/navigation";
import type { TenseName } from "@/types";
import { ArrowLeft } from "lucide-react";
import { memo } from "react";

export interface HistoryDetailHeaderProps {
  tense: TenseName;
  completedAt: string | null;
}

function formatCompletedDate(completedAt: string | null): string {
  if (!completedAt) return "";
  return new Date(completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const HistoryDetailHeader = memo(function HistoryDetailHeader({ tense, completedAt }: HistoryDetailHeaderProps) {
  const formattedDate = formatCompletedDate(completedAt);

  return (
    <header className="sticky rounded-t-lg lg:rounded-none top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <a href={NavigationRoutes.HISTORY} aria-label="Go back to history">
          <Button variant="link" size="sm" className="hidden lg:flex  gap-2">
            <ArrowLeft className="size-4" />
            <span className="font-medium">Go back</span>
          </Button>
        </a>

        <div className="flex items-center gap-2">
          <span className="font-medium">{tense}</span>
        </div>
        {completedAt && (
          <time dateTime={completedAt} className="text-xs sm:text-sm text-muted-foreground">
            {formattedDate}
          </time>
        )}
      </div>
    </header>
  );
});
