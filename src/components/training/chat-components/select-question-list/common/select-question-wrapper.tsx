import { Card, CardContent } from "@/components/ui/card";
import type { PropsWithChildren } from "react";

interface SelectQuestionWrapperProps extends PropsWithChildren {
  roundNumber: number;
  roundId: string;
}

export function SelectQuestionWrapper({ children, roundNumber, roundId }: SelectQuestionWrapperProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <h4 id={roundId} className="text-2xl font-semibold">
            Round - {roundNumber}
          </h4>
        </CardContent>
      </Card>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
