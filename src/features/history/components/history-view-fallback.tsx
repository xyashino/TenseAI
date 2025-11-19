export function HistoryViewFallback() {
  return (
    <div className="flex flex-col gap-y-4" role="status" aria-live="polite" aria-label="Loading history">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 sm:h-28 bg-muted animate-pulse rounded-lg" aria-hidden="true" />
      ))}
      <span className="sr-only">Loading your training history...</span>
    </div>
  );
}
