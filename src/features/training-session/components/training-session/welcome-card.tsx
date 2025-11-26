import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DifficultyLevel, TenseName } from "@/types";
import { memo } from "react";

interface WelcomeCardProps {
  userName?: string | null;
  tense: TenseName;
  difficulty: DifficultyLevel;
}

export const WelcomeCard = memo(function WelcomeCard({ userName, tense, difficulty }: WelcomeCardProps) {
  const displayName = userName || "there";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello {displayName}!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Welcome to your training session. Let&apos;s practice and improve together!
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1">
            <span className="text-sm font-medium text-muted-foreground">Selected Tense</span>
            <Badge className="w-fit">{tense}</Badge>
          </div>
          <div className="flex gap-1">
            <span className="text-sm font-medium text-muted-foreground">Difficulty</span>
            <Badge className="w-fit">{difficulty}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
