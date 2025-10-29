export abstract class ApiError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorType: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.errorType,
      message: this.message,
    };
  }

  toResponse(): Response {
    return new Response(JSON.stringify(this.toJSON()), {
      status: this.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export class BadRequestError extends ApiError {
  readonly statusCode = 400;
  readonly errorType = "Bad Request";

  constructor(message = "Bad request") {
    super(message);
  }
}

export class ConfigurationError extends ApiError {
  readonly statusCode = 500;
  readonly errorType = "Configuration Error";

  constructor(message = "Service configuration is invalid") {
    super(message);
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

export class ForbiddenError extends ApiError {
  readonly statusCode = 403;
  readonly errorType = "Forbidden";

  constructor(message = "Access forbidden") {
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

export class ConflictError extends ApiError {
  readonly statusCode = 409;
  readonly errorType = "Conflict";

  constructor(message = "Resource conflict") {
    super(message);
  }
}

export class ValidationError extends ApiError {
  readonly statusCode = 422;
  readonly errorType = "Validation Error";
  readonly details: Record<string, string>;

  constructor(message = "Validation failed", details: Record<string, string> = {}) {
    super(message);
    this.details = details;
  }

  toJSON() {
    return {
      error: this.errorType,
      message: this.message,
      details: this.details,
    };
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
      error: this.errorType,
      message: this.message,
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

export class ServiceUnavailableError extends ApiError {
  readonly statusCode = 503;
  readonly errorType = "Service Unavailable";

  constructor(message = "Service temporarily unavailable") {
    super(message);
  }
}

export class MalformedResponseError extends ApiError {
  readonly statusCode = 502;
  readonly errorType = "Malformed Response";
  readonly details?: unknown;

  constructor(message = "Malformed response received from upstream service", details?: unknown) {
    super(message);
    this.details = details;
  }

  toJSON() {
    return {
      error: this.errorType,
      message: this.message,
      details: this.details,
    };
  }
}
