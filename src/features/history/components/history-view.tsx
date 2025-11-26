import { withQueryClient } from "@/components/providers/with-query-client";
import { HistoryViewContent } from "./history-view-content";

export function HistoryView() {
  return (
    <div className="h-full">
      <HistoryViewContent />
    </div>
  );
}

export const HistoryViewWithQueryClient = withQueryClient(HistoryView);
