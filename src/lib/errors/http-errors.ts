import { StatusCodes } from "http-status-codes";

import { ApiError } from "./api-error";
import { ErrorCode, ErrorCodes } from "./error-codes";

export class NotFoundError extends ApiError {
  constructor(
    message = "Resource not found",
    public readonly details?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.NOT_FOUND, StatusCodes.NOT_FOUND, details);
  }
}

export class BadRequestError extends ApiError {
  constructor(
    message = "Invalid request",
    public readonly details?: Record<string, unknown>,
    public readonly code: ErrorCode = ErrorCodes.BAD_REQUEST
  ) {
    super(message, code, StatusCodes.BAD_REQUEST, details);
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = "Validation failed",
    public readonly details?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.VALIDATION, StatusCodes.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message = "Authentication required",
    public readonly details?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message = "Permission denied",
    public readonly details?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.FORBIDDEN, StatusCodes.FORBIDDEN, details);
  }
}

export class ConflictError extends ApiError {
  constructor(
    message = "Resource conflict",
    public readonly details?: Record<string, unknown>
  ) {
    super(message, ErrorCodes.CONFLICT, StatusCodes.CONFLICT, details);
  }
}

export class InternalServerError extends ApiError {
  constructor(
    code: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR,
    message = "Unexpected error occurred",
    public readonly details?: Record<string, unknown>
  ) {
    super(message, code, StatusCodes.INTERNAL_SERVER_ERROR, details, false);
  }
}
