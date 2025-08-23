import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class NotFoundException extends HttpException {
  constructor(
    message = "Resource not found",
    { code = ErrorCodes.NOT_FOUND, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.NOT_FOUND,
      details,
    });
  }
}
