import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class TooManyRequestsException extends HttpException {
  constructor(
    message = "Too many requests, please try again later",
    { code = ErrorCodes.TOO_MANY_REQUESTS, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      details,
    });
  }
}
