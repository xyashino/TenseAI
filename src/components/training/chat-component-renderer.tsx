import type { ChatComponent } from "@/types";
import { memo } from "react";
import { FinalFeedbackElement } from "./chat-components/final-feedback-element";
import { LoadingElement } from "./chat-components/loading-element";
import { RoundSummaryElement } from "./chat-components/round-summary-element";
import { SelectQuestionForm } from "./chat-components/select-question-list/select-question-list-form";
import { SelectQuestionListReadOnly } from "./chat-components/select-question-list/select-question-list-read-only";

interface ChatComponentRendererProps {
  component: ChatComponent;
}

export const ChatComponentRenderer = memo(function ChatComponentRenderer({ component }: ChatComponentRendererProps) {
  switch (component.type) {
    case "selectQuestionList":
      if (component.data.isReadOnly) {
        return (
          <SelectQuestionListReadOnly
            questions={component.data.questions}
            roundNumber={component.data.roundNumber}
            totalQuestions={component.data.totalQuestions}
            questionsReview={component.data.questionsReview}
          />
        );
      }

      return (
        <SelectQuestionForm
          questions={component.data.questions}
          roundNumber={component.data.roundNumber}
          totalQuestions={component.data.totalQuestions}
        />
      );

    case "roundSummary":
      return (
        <RoundSummaryElement
          roundNumber={component.data.roundNumber}
          score={component.data.score}
          totalQuestions={component.data.totalQuestions}
          feedback={component.data.feedback}
          questionsReview={component.data.questionsReview}
          isLoading={false}
          isReadOnly={component.data.isReadOnly}
        />
      );

    case "finalFeedback":
      return (
        <FinalFeedbackElement
          roundsScores={component.data.roundsScores}
          totalScore={component.data.totalScore}
          accuracyPercentage={component.data.accuracyPercentage}
          perfectScore={component.data.perfectScore}
          finalFeedback={component.data.finalFeedback}
        />
      );

    case "loading":
      return <LoadingElement message={component.data.message} />;

    default:
      return null;
  }
});
