import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class InternalServerErrorException extends HttpException {
  constructor(
    message = "An unexpected error occurred",
    { code = ErrorCodes.INTERNAL_SERVER_ERROR, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      details,
    });
  }
}
