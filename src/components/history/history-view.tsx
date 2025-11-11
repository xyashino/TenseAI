import { Suspense } from "react";
import { HistoryViewContent } from "./history-view-content";
import { HistoryViewFallback } from "./history-view-fallback";

export function HistoryView() {
  return (
    <div className="h-full">
      <Suspense fallback={<HistoryViewFallback />}>
        <HistoryViewContent />
      </Suspense>
    </div>
  );
}
