export abstract class ApiError extends Error {
  readonly status: "fail" | "error";
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>,
    public readonly isOperational = true
  ) {
    super(message);
    this.status = statusCode >= 500 ? "error" : "fail";
    // Error.captureStackTrace(this, this.constructor);
  }
}
