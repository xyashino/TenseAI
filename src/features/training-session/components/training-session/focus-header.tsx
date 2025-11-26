import { Button } from "@/components/ui/button";
import { NavigationRoutes } from "@/shared/enums/navigation";
import type { TenseName } from "@/types";
import { ArrowLeft } from "lucide-react";
import { memo } from "react";
import { AbandonSessionDialog } from "../dialogs/abandon-session-dialog";

interface FocusHeaderProps {
  tense: TenseName;
  sessionId?: string;
}

export const FocusHeader = memo(function FocusHeader({ tense, sessionId = "demo-session" }: FocusHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Button variant="link" size="sm" asChild>
          <a href={NavigationRoutes.TRAINING}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Go back</span>
          </a>
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-medium">{tense}</span>
        </div>
        <AbandonSessionDialog sessionId={sessionId} />
      </div>
    </header>
  );
});
