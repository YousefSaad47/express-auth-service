import { HttpExceptionOptions } from "./http-exception-options.type";

export type ExceptionOptions = Partial<
  Omit<HttpExceptionOptions, "statusCode">
>;
