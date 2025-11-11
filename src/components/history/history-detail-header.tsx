import { Button } from "@/components/ui/button";
import { NavigationRoutes } from "@/lib/enums/navigation";
import type { TenseName } from "@/types";
import { ArrowLeft } from "lucide-react";
import { memo } from "react";

/**
 * Props for the HistoryDetailHeader component
 */
export interface HistoryDetailHeaderProps {
  /** The grammar tense practiced in the session */
  tense: TenseName;
  /** ISO 8601 datetime string of when session was completed, or null if not available */
  completedAt: string | null;
}

/**
 * Formats a date string into a human-readable format.
 *
 * @param completedAt - ISO 8601 datetime string or null
 * @returns Formatted date string (e.g., "Jan 15, 2024") or empty string if null
 */
function formatCompletedDate(completedAt: string | null): string {
  if (!completedAt) return "";
  return new Date(completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Header component for the history detail view.
 *
 * Displays navigation back to history list, session tense name, and completion date.
 * Based on FocusHeader from training components but adapted for history view
 * (no abandon session dialog, different back navigation).
 *
 * @param props - Component props containing tense and completion date
 */
export const HistoryDetailHeader = memo(function HistoryDetailHeader({ tense, completedAt }: HistoryDetailHeaderProps) {
  const formattedDate = formatCompletedDate(completedAt);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Button variant="link" size="sm" asChild>
          <a href={NavigationRoutes.HISTORY} aria-label="Go back to history">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Go back</span>
          </a>
        </Button>
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
