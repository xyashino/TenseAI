import type { QuestionWithoutAnswer } from "../types";
import { z } from "zod";

/**
 * Generates a Zod schema for validating a single question answer
 * @param question - The question object without the answer
 * @returns A Zod string schema with validation for the question
 */
export const getQuestionSchema = (question: QuestionWithoutAnswer) => {
  return z
    .string()
    .min(1, "Please select an answer")
    .refine((value) => question.options.includes(value), {
      message: "Selected answer must be one of the available options",
    });
};

/**
 * Generates a Zod schema for validating a form with multiple questions
 * @param questions - Array of questions without answers
 * @param totalQuestions - Total number of questions that must be answered
 * @returns A Zod object schema with validation for all questions
 */
export const getFormSchema = (questions: QuestionWithoutAnswer[], totalQuestions: number) => {
  const schemaObject = questions.reduce(
    (acc, question) => {
      acc[question.id] = getQuestionSchema(question);
      return acc;
    },
    {} as Record<string, z.ZodString>
  );

  return z.object(schemaObject).refine(
    (data) => {
      const answeredCount = Object.values(data).filter((value) => value !== "").length;
      return answeredCount === totalQuestions;
    },
    {
      message: "Please answer all questions before continuing",
    }
  );
};
