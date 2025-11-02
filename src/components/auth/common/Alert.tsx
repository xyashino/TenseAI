import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  error: "bg-destructive/10 text-destructive",
  success: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
};

export function Alert({ variant = "info", children }: AlertProps) {
  return (
    <div className={cn("rounded-md p-3 text-sm", variantStyles[variant])} role="alert" aria-live="polite">
      {children}
    </div>
  );
}
