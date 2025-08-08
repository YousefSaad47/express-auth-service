import "dotenv/config";

import ms, { StringValue } from "ms";
import { z } from "zod";

import { logger } from "@/lib/logger";

const requiredString = z.string().min(1);

const stringValue = z.custom<StringValue>(
  (val) => {
    if (!val) return false;
    return typeof ms(val as StringValue) === "number";
  },
  {
    error: ({ input }) => `${input} is not a valid duration string`,
  }
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: requiredString,
  API_PREFIX: requiredString,
  CLIENT_URL: z.url(),

  DATABASE_URL: requiredString,
  REDIS_URL: requiredString,

  JWT_ACCESS_SECRET: requiredString,
  JWT_REFRESH_SECRET: requiredString,
  JWT_ACCESS_EXPIRATION: stringValue,
  JWT_REFRESH_EXPIRATION: stringValue,
  COOKIE_SECRET: requiredString,
  OTP_EXPIRATION: stringValue,
  MAGIC_LINK_EXPIRATION: stringValue,
  EMAIL_VERIFICATION_EXPIRATION: stringValue,
  RATE_LIMIT: requiredString,
  RATE_LIMIT_WINDOW: stringValue,
  BCRYPT_SALT_ROUNDS: requiredString,
  MAX_SIGNIN_ATTEMPTS: requiredString,
  BLOCK_TTL: stringValue,

  GOOGLE_CLIENT_ID: requiredString,
  GOOGLE_CLIENT_SECRET: requiredString,
  GOOGLE_CALLBACK_URL: requiredString,

  GITHUB_CLIENT_ID: requiredString,
  GITHUB_CLIENT_SECRET: requiredString,
  GITHUB_CALLBACK_URL: requiredString,

  TURNSTILE_SECRET_KEY: requiredString,

  EMAIL_HOST: requiredString,
  EMAIL_PORT: requiredString,
  EMAIL_SECURE: requiredString,
  EMAIL_USER: requiredString,
  EMAIL_PASSWORD: requiredString,
  EMAIL_FROM: requiredString,
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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
