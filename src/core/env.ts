/* eslint-disable @typescript-eslint/no-explicit-any */

import "dotenv/config";

import ms, { StringValue } from "ms";
import { z } from "zod";

import { logger } from "@/lib/logger";

const stringValue = z.custom<StringValue>(
  (val) => {
    if (!val) return false;
    return typeof ms(val as StringValue) === "number";
  },
  {
    error: ({ input }) => `${input} is not a valid duration string`,
  }
);

const corsOriginsSchema = z
  .string()
  .refine((val) => {
    const origins = val.split(",").map((o) => o.trim());
    return origins.every((o) => z.url().safeParse(o).success);
  }, "ALLOWED_ORIGINS must be a comma-separated list of valid URLs, e.g., <url1>,<url2>,<url3>")
  .transform((val) => val.split(",").map((o) => o.trim()));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().min(1).default("3000"),
  API_PREFIX: z.string().min(1).default("/api/v1"),
  ALLOWED_ORIGINS: corsOriginsSchema,

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  REQUEST_TIMEOUT: stringValue.default("1m"),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRATION: stringValue.default("15m"),
  JWT_REFRESH_EXPIRATION: stringValue.default("7d"),

  COOKIE_SECRET: z.string().min(1),

  OTP_EXPIRATION: stringValue.default("1m"),
  MAGIC_LINK_EXPIRATION: stringValue.default("1h"),
  EMAIL_VERIFICATION_EXPIRATION: stringValue.default("1h"),

  BCRYPT_SALT_ROUNDS: z.string().min(1).default("12"),

  RATE_LIMIT: z.string().min(1).default("100"),
  RATE_LIMIT_WINDOW: stringValue.default("1h"),

  MAX_SIGNIN_ATTEMPTS: z.string().min(1).default("10"),
  BLOCK_TTL: stringValue.default("15m"),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z
    .string()
    .min(1)
    .default("http://localhost:3000/api/v1/auth/google/callback"),

  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z
    .string()
    .min(1)
    .default("http://localhost:3000/api/v1/auth/github/callback"),

  TURNSTILE_SECRET_KEY: z.string().min(1),

  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().min(1),
  EMAIL_SECURE: z.string().min(1),
  EMAIL_USER: z.string().min(1),
  EMAIL_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().min(1),

  SENTRY_DSN: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error(
    `❌ Invalid environment variables: ${JSON.stringify(
      z.treeifyError(parsed.error),
      null,
      2
    )}`
  );
  process.exit(1);
}

const envVars =
  process.env.NODE_ENV === "development"
    ? parsed.data
    : Object.keys(parsed.data);

logger.info(
  `Loaded environment variables: ${JSON.stringify(envVars, null, 2)}`
);

export const ALLOWED_ORIGINS = parsed.data.ALLOWED_ORIGINS;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
