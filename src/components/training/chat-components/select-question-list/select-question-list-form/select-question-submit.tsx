import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface QuestionSubmitProps {
  roundNumber: number;
}

export function QuestionSubmit({ roundNumber }: QuestionSubmitProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Round {roundNumber}</h3>
      </div>

      <Button size="lg" className="w-auto" type="submit">
        <CheckCircle className="mr-2 h-5 w-5" />
        Check Answers
      </Button>
    </div>
  );
}
