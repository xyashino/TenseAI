import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface FinalFeedbackHeaderProps {
  perfectScore: boolean;
}

export function FinalFeedbackHeader({ perfectScore }: FinalFeedbackHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="text-xl sm:text-2xl">Training Complete!</CardTitle>
        {perfectScore && (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white gap-1.5 px-3 py-1">
            <Trophy className="w-3.5 h-3.5" />
            Perfect Score!
          </Badge>
        )}
      </div>
    </CardHeader>
  );
}
