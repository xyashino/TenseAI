import { ApiError, InternalServerError, NotFoundError, ValidationError } from "@/server/errors/api-errors";
import { ZodError } from "zod";

function handleZodError(error: ZodError): ValidationError {
  const details: Record<string, string> = {};
  const issues = error.issues || [];

  issues.forEach((issue) => {
    const field = issue.path.map(String).join(".") || "root";
    details[field] = issue.message;
  });

  return new ValidationError("Invalid request data", details);
}

function handleServiceError(error: Error): ApiError {
  if (error.message === "Profile not found") {
    return new NotFoundError("Profile not found");
  }
  if (error.message === "Session not found") {
    return new NotFoundError("Session not found");
  }
  if (error.message === "Round not found") {
    return new NotFoundError("Round not found");
  }
  if (error.message === "Question not found") {
    return new NotFoundError("Question not found");
  }

  return new InternalServerError();
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  if (error instanceof ZodError) {
    const validationError = handleZodError(error);
    return validationError.toResponse();
  }

  if (error instanceof Error) {
    const apiError = handleServiceError(error);
    return apiError.toResponse();
  }

  const internalError = new InternalServerError();
  return internalError.toResponse();
}
