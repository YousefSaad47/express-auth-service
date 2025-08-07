import "dotenv/config";

import ms, { StringValue } from "ms";
import { z } from "zod";

import { logger } from "@/lib/logger";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().min(1),
  API_PREFIX: z.string().min(1),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRATION: z.custom<StringValue>(
    (val) => {
      if (!val) return false;
      return typeof ms(val as StringValue) === "number";
    },
    {
      error: ({ input }) => `${input} is not a valid duration string`,
    }
  ),
  JWT_REFRESH_EXPIRATION: z.custom<StringValue>(
    (val) => {
      if (!val) return false;
      return typeof ms(val as StringValue) === "number";
    },
    {
      error: ({ input }) => `${input} is not a valid duration string`,
    }
  ),
  OTP_EXPIRATION: z.custom<StringValue>(
    (val) => {
      if (!val) return false;
      return typeof ms(val as StringValue) === "number";
    },
    {
      error: ({ input }) => `${input} is not a valid duration string`,
    }
  ),
  MAGIC_LINK_EXPIRATION: z.custom<StringValue>(
    (val) => {
      if (!val) return false;
      return typeof ms(val as StringValue) === "number";
    },
    {
      error: ({ input }) => `${input} is not a valid duration string`,
    }
  ),
  EMAIL_VERIFICATION_EXPIRATION: z.custom<StringValue>(
    (val) => {
      if (!val) return false;
      return typeof ms(val as StringValue) === "number";
    },
    {
      error: ({ input }) => `${input} is not a valid duration string for`,
    }
  ),
  RATE_LIMIT: z.string().min(1),
  RATE_LIMIT_WINDOW: z.custom<StringValue>(
    (val) => {
      if (!val) return false;
      return typeof ms(val as StringValue) === "number";
    },
    {
      error: ({ input }) => `${input} is not a valid duration string`,
    }
  ),
  BCRYPT_SALT_ROUNDS: z.string().min(1),
  MAX_SIGNIN_ATTEMPTS: z.string().min(1),
  BLOCK_TTL: z.custom<StringValue>(
    (val) => {
      if (!val) return false;
      return typeof ms(val as StringValue) === "number";
    },
    {
      error: ({ input }) => `${input} is not a valid duration string`,
    }
  ),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().min(1),

  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().min(1),

  TURNSTILE_SECRET_KEY: z.string().min(1),

  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().min(1),
  EMAIL_SECURE: z.string().min(1),
  EMAIL_USER: z.string().min(1),
  EMAIL_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
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

process.env.REDIS_URL = parsed.data.REDIS_URL;

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
