import { Button } from "@/components/ui/button";
import { NavigationRoutes } from "@/shared/enums/navigation";
import { navigate } from "astro:transitions/client";
import { Home, RotateCcw } from "lucide-react";

export function FinalFeedbackActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate(NavigationRoutes.HISTORY)}>
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Button>
      <Button className="flex-1 gap-2" onClick={() => navigate(NavigationRoutes.TRAINING)}>
        <RotateCcw className="w-4 h-4" />
        Start New Session
      </Button>
    </div>
  );
}
