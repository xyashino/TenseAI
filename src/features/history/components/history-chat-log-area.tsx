import { ChatComponentRenderer } from "@/features/training/components/training-session/chat-component-renderer";
import { ChatLogWrapper } from "@/features/training/components/training-session/chat-log-wrapper";
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
    <ChatLogWrapper className="flex-1 overflow-y-auto no-scrollbar px-4 py-6">
      <HistoryWelcomeCard userName={userName} tense={tense} difficulty={difficulty} summary={summary} />
      {chatComponents.map((component) => (
        <ChatComponentRenderer key={component.id} component={component} />
      ))}
    </ChatLogWrapper>
  );
});
