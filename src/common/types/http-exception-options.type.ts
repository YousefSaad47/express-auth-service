import { ErrorCode } from "@/common/enums";

export type HttpExceptionOptions = {
  code: ErrorCode;
  statusCode: number;
  details?: Record<string, unknown>;
};
