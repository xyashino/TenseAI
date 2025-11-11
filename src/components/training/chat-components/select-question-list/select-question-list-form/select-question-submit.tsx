import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { ChatLogWrapper } from "../../../chat-log-wrapper";

interface QuestionSubmitProps {
  roundNumber: number;
  answeredCount: number;
  totalQuestions: number;
  hasError: boolean;
}

export function QuestionSubmit({ roundNumber, answeredCount, totalQuestions, hasError }: QuestionSubmitProps) {
  const remaining = totalQuestions - answeredCount;

  return (
    <ChatLogWrapper>
      <Card className={cn(hasError && "border-destructive")}>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg sm:text-xl font-semibold">Round {roundNumber}</h3>
            {remaining > 0 && (
              <p className="text-sm sm:text-base text-destructive">- {remaining} remaining to answer</p>
            )}
          </div>

          <Button size="lg" className="w-full" type="submit">
            <CheckCircle className="mr-2 h-5 w-5" />
            Check Answers
          </Button>
        </CardContent>
      </Card>
    </ChatLogWrapper>
  );
}
