import { ErrorCodes, HttpStatus } from "@/common/enums";
import { ExceptionOptions } from "@/common/types";

import { HttpException } from "./http.exception";

export class GatewayTimeoutException extends HttpException {
  constructor(
    message = "Gateway Timeout",
    { code = ErrorCodes.GATEWAY_TIMEOUT, details }: ExceptionOptions = {}
  ) {
    super(message, {
      code,
      statusCode: HttpStatus.GATEWAY_TIMEOUT,
      details,
    });
  }
}
