import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class UnauthorizedException extends HttpException {
  constructor(
    message = "Authentication is required",
    { code = ErrorCodes.UNAUTHORIZED, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.UNAUTHORIZED,
      details,
    });
  }
}
