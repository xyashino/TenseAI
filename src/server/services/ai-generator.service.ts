import { OpenRouterService } from "@/server/services/open-router-service";
import type { DifficultyLevel, TenseName } from "@/types";
import { z } from "zod";

interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

const questionSchema = z.object({
  question_text: z.string().describe("The question text with a blank represented by '___'"),
  options: z.array(z.string()).length(4).describe("Exactly 4 multiple-choice options"),
  correct_answer: z.string().describe("The correct answer (must be one of the options)"),
});

const questionsResponseSchema = z.object({
  questions: z.array(questionSchema).describe("Array of generated questions"),
});

export class AIGeneratorService {
  private openRouterService: OpenRouterService;
  private readonly model = "openai/gpt-4o-mini";

  constructor() {
    this.openRouterService = new OpenRouterService();
  }

  async generateQuestions(tense: TenseName, difficulty: DifficultyLevel, count: number): Promise<GeneratedQuestion[]> {
    if (count <= 0 || count > 20) {
      throw new Error("Count must be between 1 and 20");
    }
    try {
      const completion = await this.openRouterService.getChatCompletionFromPrompt({
        model: this.model,
        promptName: "generate-questions",
        variables: {
          tense,
          difficulty,
          count: count.toString(),
        },
        responseFormat: questionsResponseSchema,
        temperature: 0.7,
        maxTokens: 2000,
      });
      const parsed = questionsResponseSchema.parse(JSON.parse(completion));
      console.log({ parsed });
      return parsed.questions;
    } catch (error) {
      throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateRoundFeedback(
    incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
    }[],
    tense: TenseName,
    difficulty: DifficultyLevel,
    score: number
  ): Promise<string> {
    if (score < 0 || score > 10) {
      throw new Error("Score must be between 0 and 10");
    }
    try {
      const incorrectAnswersJson = JSON.stringify(incorrectAnswers);
      const feedback = await this.openRouterService.getChatCompletionFromPrompt({
        model: this.model,
        promptName: "round-feedback",
        variables: {
          tense,
          difficulty,
          score: score.toString(),
          incorrect_answers_json: incorrectAnswersJson,
        },
        temperature: 0.8,
        maxTokens: 500,
      });
      if (!feedback || typeof feedback !== "string") {
        throw new Error("No feedback content from AI");
      }
      return feedback.trim();
    } catch (error) {
      throw new Error(`Failed to generate round feedback: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateFinalFeedback(
    incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
      round_number: number;
      question_number: number;
    }[],
    tense: TenseName,
    difficulty: DifficultyLevel,
    roundsScores: number[]
  ): Promise<string> {
    try {
      const totalQuestions = 30;
      const correctAnswers = totalQuestions - incorrectAnswers.length;
      const accuracyPercentage = Math.round((correctAnswers / totalQuestions) * 100);

      const incorrectAnswersJson = JSON.stringify(incorrectAnswers);

      const completion = await this.openRouterService.getChatCompletionFromPrompt({
        model: this.model,
        promptName: "final-feedback",
        variables: {
          tense,
          difficulty,
          total_correct: correctAnswers.toString(),
          accuracy_percentage: accuracyPercentage.toString(),
          rounds_scores: roundsScores.join(" → "),
          incorrect_count: incorrectAnswers.length.toString(),
          incorrect_answers_json: incorrectAnswersJson,
        },
        temperature: 0.8,
        maxTokens: 2000,
      });

      if (!completion || typeof completion !== "string") {
        throw new Error("No feedback content from AI");
      }
      return completion.trim();
    } catch (error) {
      throw new Error(`Failed to generate final feedback: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export const aiGeneratorService = new AIGeneratorService();
