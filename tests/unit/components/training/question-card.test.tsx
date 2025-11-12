import { QuestionCard } from "@/components/training/chat-components/select-question-list/common/question-card";
import type { QuestionWithoutAnswer } from "@/types";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../../test-utils";

vi.mock("@/components/training/chat-components/select-question-list/common/question-header", () => ({
  QuestionHeader: ({
    questionText,
    questionNumber,
  }: {
    questionText: string;
    questionNumber: number;
  }) => (
    <div>
      <span>Question {questionNumber}</span>
      <p>{questionText}</p>
    </div>
  ),
}));

vi.mock("@/components/training/chat-components/select-question-list/common/question-options", () => ({
  QuestionOptions: ({
    options,
    value,
    onValueChange,
    selectedAnswer,
    correctAnswer,
    isCorrect,
  }: {
    options: string[];
    value?: string;
    onValueChange?: (value: string) => void;
    selectedAnswer?: string;
    correctAnswer?: string;
    isCorrect?: boolean;
  }) => (
    <div>
      {options.map((option: string, index: number) => (
        <label key={index}>
          <input
            type="radio"
            value={option}
            checked={value === option || selectedAnswer === option}
            onChange={(e) => onValueChange?.(e.target.value)}
            disabled={!onValueChange}
            data-test-id={`option-${index}`}
            data-correct={option === correctAnswer}
            data-is-correct={isCorrect}
          />
          {option}
        </label>
      ))}
    </div>
  ),
}));

describe("QuestionCard", () => {
  const mockQuestion: QuestionWithoutAnswer = {
    id: "question-1",
    question_text: "What is the correct form?",
    options: ["Option A", "Option B", "Option C", "Option D"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Mode", () => {
    it("should render question card with question text and options", () => {
      const mockOnChange = vi.fn();

      render(
        <QuestionCard
          question={mockQuestion}
          questionNumber={1}
          roundNumber={1}
          totalQuestions={10}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/question 1/i)).toBeInTheDocument();
      expect(screen.getByText("What is the correct form?")).toBeInTheDocument();
      expect(screen.getByTestId("option-0")).toBeInTheDocument();
      expect(screen.getByTestId("option-1")).toBeInTheDocument();
    });

    it("should allow user to select an answer", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <QuestionCard
          question={mockQuestion}
          questionNumber={1}
          roundNumber={1}
          totalQuestions={10}
          value=""
          onChange={mockOnChange}
        />
      );

      const option1 = screen.getByTestId("option-0");
      await user.click(option1);

      expect(mockOnChange).toHaveBeenCalledWith("Option A");
    });

    it("should display error state when hasError is true", () => {
      const mockOnChange = vi.fn();

      const { container } = render(
        <QuestionCard
          question={mockQuestion}
          questionNumber={1}
          roundNumber={1}
          totalQuestions={10}
          value=""
          onChange={mockOnChange}
          hasError={true}
        />
      );

      const card = container.querySelector('[class*="border-destructive"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe("Read-Only Mode", () => {
    it("should render question card with selected answer", () => {
      render(
        <QuestionCard
          question={mockQuestion}
          questionNumber={1}
          roundNumber={1}
          totalQuestions={10}
          selectedAnswer="Option A"
          correctAnswer="Option B"
          isCorrect={false}
        />
      );

      expect(screen.getByText(/question 1/i)).toBeInTheDocument();
      const option0 = screen.getByTestId("option-0");
      expect(option0).toBeChecked();
    });

    it("should display correct answer indicator when answer is correct", () => {
      render(
        <QuestionCard
          question={mockQuestion}
          questionNumber={1}
          roundNumber={1}
          totalQuestions={10}
          selectedAnswer="Option A"
          correctAnswer="Option A"
          isCorrect={true}
        />
      );

      const option0 = screen.getByTestId("option-0");
      expect(option0).toHaveAttribute("data-is-correct", "true");
    });

    it("should display incorrect answer indicator when answer is wrong", () => {
      render(
        <QuestionCard
          question={mockQuestion}
          questionNumber={1}
          roundNumber={1}
          totalQuestions={10}
          selectedAnswer="Option A"
          correctAnswer="Option B"
          isCorrect={false}
        />
      );

      const option0 = screen.getByTestId("option-0");
      expect(option0).toHaveAttribute("data-is-correct", "false");
    });

    it("should disable options in read-only mode", () => {
      render(
        <QuestionCard
          question={mockQuestion}
          questionNumber={1}
          roundNumber={1}
          totalQuestions={10}
          selectedAnswer="Option A"
          correctAnswer="Option B"
          isCorrect={false}
        />
      );

      const option0 = screen.getByTestId("option-0");
      expect(option0).toBeDisabled();
    });
  });
});
