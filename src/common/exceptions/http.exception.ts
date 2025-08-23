/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpExceptionOptions } from "@/common/types";

export class HttpException extends Error {
  readonly status: "fail" | "error";
  readonly code: string;
  readonly statusCode: number;
  readonly details?: Record<string, any>;

  constructor(
    message: string,
    { code, statusCode, details }: HttpExceptionOptions
  ) {
    super(message);

    this.name = HttpException.name;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    if (process.env.NODE_ENV === "development" && this.isFatal) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(requestId?: string) {
    return {
      error: {
        status: this.status,
        status_code: this.statusCode,
        code: this.code,
        message: this.message,
        details: this.details,
      },
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  get isFatal() {
    return this.statusCode >= 500;
  }
}
