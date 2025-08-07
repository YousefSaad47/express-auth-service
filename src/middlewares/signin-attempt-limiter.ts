import { RequestHandler } from "express";

import ms from "ms";

import { redis } from "@/core/redis";

export const MAX_SIGNIN_ATTEMPTS = Number(process.env.MAX_SIGNIN_ATTEMPTS);
export const BLOCK_TTL = ms(process.env.BLOCK_TTL) / 1000;
export const getSignInAttemptsRedisKey = (ip: string | undefined) => {
  return `signin_attempts:${ip}`;
};

export const signInAttemptsLimiter: RequestHandler = async (req, res, next) => {
  const key = getSignInAttemptsRedisKey(req.ip);

  const attempts = parseInt((await redis.get(key)) || "0");

  if (attempts >= MAX_SIGNIN_ATTEMPTS) {
    const blockTime = await redis.ttl(key);
    if (blockTime > 0) {
      return res.status(429).json({
        error: "Too many sign-in attempts, Please try again later",
        retryAfter: blockTime,
      });
    }
  }

  Object.defineProperty(req, "signInAttempts", {
    value: attempts,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  next();
};

export const incrementSignInAttempts = async (key: string) => {
  const attempts = await redis.incr(key);
  await redis.setex(key, BLOCK_TTL, attempts);
};

export const resetSignInAttempts = async (key: string) => {
  await redis.del(key);
};
