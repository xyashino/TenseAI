import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { memo } from "react";

interface LoadingElementProps {
  message: string;
}

export const LoadingElement = memo(function LoadingElement({ message }: LoadingElementProps) {
  return (
    <Card className="bg-muted/70">
      <CardContent className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
});
