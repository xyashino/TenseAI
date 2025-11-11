import { ChatComponentRenderer } from "@/components/training/chat-component-renderer";
import { ChatLogWrapper } from "@/components/training/chat-log-wrapper";
import type { ChatComponent, DifficultyLevel, SessionSummary, TenseName } from "@/types";
import { memo } from "react";
import { HistoryWelcomeCard } from "./history-welcome-card";

interface HistoryChatLogAreaProps {
  chatComponents: ChatComponent[];
  userName?: string | null;
  tense: TenseName;
  difficulty: DifficultyLevel;
  summary: SessionSummary;
}

export const HistoryChatLogArea = memo(function HistoryChatLogArea({
  chatComponents,
  userName,
  tense,
  difficulty,
  summary,
}: HistoryChatLogAreaProps) {
  return (
    <ChatLogWrapper className="flex-1 py-6">
      <HistoryWelcomeCard userName={userName} tense={tense} difficulty={difficulty} summary={summary} />
      {chatComponents.map((component) => (
        <ChatComponentRenderer key={component.id} component={component} />
      ))}
    </ChatLogWrapper>
  );
});
