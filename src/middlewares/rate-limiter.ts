import rateLimit from "express-rate-limit";
import ms from "ms";

export const rateLimiter = rateLimit({
  limit: Number(process.env.RATE_LIMIT),
  windowMs: ms(process.env.RATE_LIMIT_WINDOW),
  message: "Too many requests, please try again later.",
});
