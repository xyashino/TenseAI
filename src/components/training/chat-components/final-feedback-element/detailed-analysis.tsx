import { memo } from "react";
import ReactMarkdown from "react-markdown";

interface DetailedAnalysisProps {
  finalFeedback: string;
}

export const DetailedAnalysis = memo(function DetailedAnalysis({ finalFeedback }: DetailedAnalysisProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Detailed Analysis</h4>
      <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg">
        <ReactMarkdown>{finalFeedback}</ReactMarkdown>
      </div>
    </div>
  );
});
