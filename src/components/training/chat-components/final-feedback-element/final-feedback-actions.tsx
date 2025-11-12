import { Button } from "@/components/ui/button";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { History, PlayIcon } from "lucide-react";
import { memo } from "react";

export const FinalFeedbackActions = memo(function FinalFeedbackActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4" data-test-id="final-feedback-actions">
      <Button variant="default" className="w-full sm:flex-1" size="lg" asChild>
        <a href={NavigationRoutes.HISTORY} data-test-id="view-history-button">
          <History className="h-4 w-4 mr-2" />
          View History
        </a>
      </Button>
      <Button variant="outline" className="w-full sm:flex-1" size="lg" asChild>
        <a href={NavigationRoutes.TRAINING} data-test-id="start-new-session-button">
          <PlayIcon className="h-4 w-4 mr-2" />
          Start New Session
        </a>
      </Button>
    </div>
  );
});
