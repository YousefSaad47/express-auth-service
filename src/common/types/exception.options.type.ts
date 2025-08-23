import { HttpExceptionOptions } from "./http-excception-options.type";

export type ExceptionOptions = Partial<
  Omit<HttpExceptionOptions, "statusCode">
>;
