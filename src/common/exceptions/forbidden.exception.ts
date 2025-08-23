import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class ForbiddenException extends HttpException {
  constructor(
    message = "You do not have permission to perform this action",
    { code = ErrorCodes.FORBIDDEN, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.FORBIDDEN,
      details,
    });
  }
}
