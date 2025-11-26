export abstract class ApiError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorType: string;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.errorType,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }

  toResponse(): Response {
    return new Response(JSON.stringify(this.toJSON()), {
      status: this.statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export class BadRequestError extends ApiError {
  readonly statusCode = 400;
  readonly errorType = "Bad Request";

  constructor(message = "Bad request", details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class AuthenticationError extends ApiError {
  readonly statusCode = 401;
  readonly errorType = "Authentication Failed";

  constructor(message = "Authentication failed") {
    super(message);
  }
}

export class UnauthorizedError extends ApiError {
  readonly statusCode = 401;
  readonly errorType = "Unauthorized";

  constructor(message = "Authentication required") {
    super(message);
  }
}

export class NotFoundError extends ApiError {
  readonly statusCode = 404;
  readonly errorType = "Not Found";

  constructor(message = "Resource not found") {
    super(message);
  }
}

export class ValidationError extends ApiError {
  readonly statusCode = 422;
  readonly errorType = "Validation Error";

  constructor(message = "Validation failed", details: Record<string, string> = {}) {
    super(message, details);
  }
}

export class RateLimitError extends ApiError {
  readonly statusCode = 429;
  readonly errorType = "Rate Limit Exceeded";
  readonly retryAfter: number;

  constructor(message = "Rate limit exceeded", retryAfter = 60) {
    super(message);
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retry_after: this.retryAfter,
    };
  }
}

export class InternalServerError extends ApiError {
  readonly statusCode = 500;
  readonly errorType = "Internal Server Error";

  constructor(message = "An unexpected error occurred") {
    super(message);
  }
}
