import { ErrorBoundary } from "@/components/common/error-boundary";
import { Suspense } from "react";
import { HistoryViewContent } from "./history-view-content";
import { HistoryViewFallback } from "./history-view-fallback";
import { PageHeader } from "./page-header";

export function HistoryView() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader />
      <div className="flex-grow">
        <ErrorBoundary context="History view">
          <Suspense fallback={<HistoryViewFallback />}>
            <HistoryViewContent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
