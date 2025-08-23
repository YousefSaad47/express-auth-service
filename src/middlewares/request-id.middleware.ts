import { randomUUID } from "crypto";

import { RequestHandler } from "express";

type RequestIdOptions = {
  headerName?: string;
  generator?: () => string;
};

export const requestId = ({
  headerName = "X-Request-Id",
  generator = randomUUID,
}: RequestIdOptions = {}): RequestHandler => {
  return (req, res, next) => {
    const requestId = req.header(headerName) || generator();

    req.id = requestId;
    res.setHeader(headerName, requestId);

    next();
  };
};
