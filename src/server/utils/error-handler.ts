import { ApiError, InternalServerError, ValidationError } from "@/server/errors/api-errors";
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

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  if (error instanceof ZodError) {
    const validationError = handleZodError(error);
    return validationError.toResponse();
  }

  // Log unexpected errors for debugging (only in development or with proper logging service)
  if (error instanceof Error) {
    console.error("Unexpected error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error("Unexpected non-Error object:", error);
  }

  const internalError = new InternalServerError();
  return internalError.toResponse();
}
