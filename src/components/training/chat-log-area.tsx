import type { ChatComponent, DifficultyLevel, TenseName } from "@/types";
import { memo } from "react";
import { ChatComponentRenderer } from "./chat-component-renderer";
import { WelcomeCard } from "./chat-components/welcome-card";
import { ChatLogWrapper } from "./chat-log-wrapper";

interface ChatLogAreaProps {
  chatComponents: ChatComponent[];
  userName?: string | null;
  tense: TenseName;
  difficulty: DifficultyLevel;
}

export const ChatLogArea = memo(function ChatLogArea({
  chatComponents,
  userName,
  tense,
  difficulty,
}: ChatLogAreaProps) {
  return (
    <ChatLogWrapper className="flex-1 overflow-y-auto px-4 py-6">
      <WelcomeCard userName={userName} tense={tense} difficulty={difficulty} />
      {chatComponents.map((component) => (
        <ChatComponentRenderer key={component.id} component={component} />
      ))}
    </ChatLogWrapper>
  );
});
