import { Request, Response } from "express";

import rateLimit from "express-rate-limit";
import ms from "ms";

import { TooManyRequestsException } from "@/common/exceptions";

type RateLimiterOptions = {
  limit?: number;
  windowMs?: number;
};

const createThrottler = ({
  limit = Number(process.env.RATE_LIMIT),
  windowMs = Number(process.env.RATE_LIMIT_WINDOW),
}: RateLimiterOptions = {}) => {
  const err = new TooManyRequestsException();

  return rateLimit({
    limit,
    windowMs,
    message: (req: Request, res: Response) => {
      res.status(err.statusCode).json(err.toJSON(req.id));
    },
    skipSuccessfulRequests: true,
  });
};

export const globalThrottler = createThrottler();

export const authThrottler = createThrottler({
  limit: 20,
  windowMs: ms("1h"),
});
