import { Loader2 } from "lucide-react";
import { memo } from "react";
import type { LoadingElementProps } from "./types";

export const LoadingElement = memo(function LoadingElement({ message }: LoadingElementProps) {
  return (
    <div className="flex items-center gap-3 p-6 border rounded-lg bg-muted/30">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
});
