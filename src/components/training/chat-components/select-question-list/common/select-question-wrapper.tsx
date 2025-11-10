import type { PropsWithChildren } from "react";

interface SelectQuestionWrapperProps extends PropsWithChildren {
  roundNumber: number;
  roundId: string;
}

export function SelectQuestionWrapper({ children, roundNumber, roundId }: SelectQuestionWrapperProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 px-6 border-2 rounded-lg bg-card">
        <h4 id={roundId} className="text-2xl font-semibold">
          Round - {roundNumber}
        </h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
