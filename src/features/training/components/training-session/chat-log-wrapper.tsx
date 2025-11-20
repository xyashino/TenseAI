import { cn } from "@/shared/utils/cn";
import type { PropsWithChildren } from "react";
import { memo } from "react";

interface ChatLogWrapperProps extends PropsWithChildren {
  className?: string;
}

export const ChatLogWrapper = memo(function ChatLogWrapper({ children, className }: ChatLogWrapperProps) {
  return <div className={cn("container max-w-3xl mx-auto space-y-6", className)}>{children}</div>;
});
