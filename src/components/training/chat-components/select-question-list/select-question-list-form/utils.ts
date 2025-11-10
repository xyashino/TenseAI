import type { QuestionWithoutAnswer } from "@/types";
import { z } from "zod";

export const getQuestionSchema = (question: QuestionWithoutAnswer) => {
  return z
    .string()
    .min(1, "Please select an answer")
    .refine((value) => question.options.includes(value), {
      message: "Selected answer must be one of the available options",
    });
};

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
