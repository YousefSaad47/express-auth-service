export enum ErrorCodes {
  NOT_FOUND = "not_found",
  BAD_REQUEST = "bad_request",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  CONFLICT = "conflict",
  TOO_MANY_REQUESTS = "too_many_requests",
  INTERNAL_SERVER_ERROR = "internal_server_error",
  GATEWAY_TIMEOUT = "gateway_timeout",
  VALIDATION = "validation",
  TOKEN_EXPIRED = "token_expired",
  TOKEN_INVALID = "token_invalid",
}

export type ErrorCode = keyof typeof ErrorCodes | (string & {});
