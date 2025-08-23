import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class ConflictException extends HttpException {
  constructor(
    message = "Resource conflict occurred",
    { code = ErrorCodes.CONFLICT, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.CONFLICT,
      details,
    });
  }
}
