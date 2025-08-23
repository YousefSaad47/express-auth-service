import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class ValidationException extends HttpException {
  constructor(
    message = "Validation failed",
    { code = ErrorCodes.VALIDATION, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.BAD_REQUEST,
      details,
    });
  }
}
