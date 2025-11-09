import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { memo } from "react";

interface FinalFeedbackActionsProps {
  onViewHistory: () => void;
  onStartNewSession: () => void;
}

export const FinalFeedbackActions = memo(function FinalFeedbackActions({
  onViewHistory,
  onStartNewSession,
}: FinalFeedbackActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button onClick={onViewHistory} variant="default" className="flex-1" size="lg">
        <History className="h-4 w-4 mr-2" />
        View History
      </Button>
      <Button onClick={onStartNewSession} variant="outline" className="flex-1" size="lg">
        Start New Session
      </Button>
    </div>
  );
});
