import type { ChatComponent, DifficultyLevel, TenseName } from "@/types";
import { ChatLogArea } from "./chat-log-area";
import { FocusHeader } from "./focus-header";

interface TrainingSessionViewProps {
  tense: TenseName;
  difficulty: DifficultyLevel;
  chatComponents: ChatComponent[];
  sessionId?: string;
  userName?: string | null;
}

export function TrainingSessionView({
  tense,
  difficulty,
  chatComponents,
  sessionId,
  userName,
}: TrainingSessionViewProps) {
  return (
    <div className="flex flex-col h-full">
      <FocusHeader tense={tense} sessionId={sessionId} />
      <ChatLogArea chatComponents={chatComponents} userName={userName} tense={tense} difficulty={difficulty} />
    </div>
  );
}
