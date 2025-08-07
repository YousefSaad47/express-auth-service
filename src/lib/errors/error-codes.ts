export enum ErrorCodes {
  NOT_FOUND = "resource_not_found",
  BAD_REQUEST = "invalid_input",
  UNAUTHORIZED = "auth_required",
  FORBIDDEN = "permission_denied",
  CONFLICT = "resource_conflict",
  INTERNAL_SERVER_ERROR = "server_error",
  DB_FAILURE = "database_error",
  VALIDATION = "validation_failed",
  TOKEN_EXPIRED = "token_expired",
  TOKEN_INVALID = "token_invalid",
}

export type ErrorCode = keyof typeof ErrorCodes | (string & {});
