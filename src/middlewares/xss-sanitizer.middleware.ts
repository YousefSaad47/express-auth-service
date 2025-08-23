/* eslint-disable @typescript-eslint/no-explicit-any */

import { RequestHandler } from "express";

import xss from "xss";

const sanitize = (input: any): any => {
  if (typeof input === "string") {
    return xss(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitize);
  }

  if (typeof input === "object") {
    Object.keys(input).forEach((key) => {
      input[key] = sanitize(input[key]);
    });

    return input;
  }

  return input;
};

// Used globally
export const xssSanitizerBodyQuery: RequestHandler = (req, res, next) => {
  req.body = sanitize(req.body);

  Object.defineProperty(req, "query", {
    value: sanitize(req.query),
    writable: false,
    enumerable: true,
    configurable: false,
  });

  next();
};

/**
 * To sanitize route params should be used at router level
 * @example
 * app.get("/<resource>/:<param>", xssSanitizerParams, handler);
 * @example
 * router.get("/<resource>/:<param>", xssSanitizerParams, handler);
 */
export const xssSanitizerParams: RequestHandler = (req, res, next) => {
  req.params = sanitize(req.params);

  next();
};
