import ReactMarkdown from "react-markdown";

interface DetailedAnalysisProps {
  finalFeedback: string;
}

export function DetailedAnalysis({ finalFeedback }: DetailedAnalysisProps) {
  if (!finalFeedback) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Detailed Analysis</h4>
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm bg-muted/30 p-4 rounded-lg border">
        <ReactMarkdown>{finalFeedback}</ReactMarkdown>
      </div>
    </div>
  );
}
