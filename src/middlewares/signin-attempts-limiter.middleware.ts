import { RequestHandler } from "express";

import ms from "ms";

import { TooManyRequestsException } from "@/common/exceptions";
import { redis } from "@/core/redis";
import { getClientIp } from "@/lib/utils/ip.util";

const MAX_SIGNIN_ATTEMPTS = Number(process.env.MAX_SIGNIN_ATTEMPTS);
const BLOCK_TTL = ms(process.env.BLOCK_TTL) / 1000;

export const getSignInAttemptsRedisKey = (ip: string | undefined) => {
  return `signin_attempts:${ip}`;
};

export const signInAttemptsLimiter: RequestHandler = async (req, res, next) => {
  const ip = getClientIp(req);

  const key = getSignInAttemptsRedisKey(ip!);

  const attempts = Number((await redis.get(key)) ?? "0");

  if (attempts >= MAX_SIGNIN_ATTEMPTS) {
    const blockTime = await redis.ttl(key);
    if (blockTime > 0) {
      throw new TooManyRequestsException(undefined, {
        details: { retry_after: blockTime },
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
