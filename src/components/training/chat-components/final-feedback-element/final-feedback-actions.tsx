import { Button } from "@/components/ui/button";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { History, PlayIcon } from "lucide-react";
import { memo } from "react";

export const FinalFeedbackActions = memo(function FinalFeedbackActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button variant="default" className="flex-1" size="lg" asChild>
        <a href={NavigationRoutes.HISTORY}>
          <History className="h-4 w-4 mr-2" />
          View History
        </a>
      </Button>
      <Button variant="outline" className="flex-1" size="lg" asChild>
        <a href={NavigationRoutes.TRAINING}>
          <PlayIcon className="h-4 w-4 mr-2" />
          Start New Session
        </a>
      </Button>
    </div>
  );
});
