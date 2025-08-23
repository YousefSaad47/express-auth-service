import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class BadRequestException extends HttpException {
  constructor(
    message = "Invalid request",
    { code = ErrorCodes.BAD_REQUEST, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.BAD_REQUEST,
      details,
    });
  }
}
