import { randomBytes } from "crypto";

import { RequestHandler } from "express";

import { redis } from "@/core/redis";
import { UnauthorizedError } from "@/lib/errors/http-errors";

export const getCSRFRedisKey = (ip: string | undefined) => {
  return `csrf:${ip}`;
};

export const generateCSRF = () => {
  return randomBytes(32).toString("hex");
};

const csrfMethods = ["POST", "PUT", "PATCH", "DELETE"];

export const csrf: RequestHandler = async (req, res, next) => {
  const csrf = req.headers["x-csrf"];

  if (!csrfMethods.includes(req.method)) {
    return next();
  }

  if (
    req.path.startsWith("/auth") &&
    // and not password update
    !(req.path === "/auth/password") &&
    !(req.method === "PATCH")
  ) {
    return next();
  }

  if (!csrf) {
    throw new UnauthorizedError("CSRF token missing");
  }

  const storedCSRF = await redis.get(getCSRFRedisKey(req.ip));

  if (!storedCSRF || storedCSRF !== csrf) {
    throw new UnauthorizedError("Invalid CSRF token");
  }

  next();
};
