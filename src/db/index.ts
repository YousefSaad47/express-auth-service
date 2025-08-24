/* eslint-disable @typescript-eslint/no-explicit-any */

import chalk from "chalk";

import { ALLOWED_ORIGINS } from "@/core/env";
import { PrismaClient, User } from "@/generated/prisma";
import { enqueueEmail } from "@/lib/bullmq/queues/email.queue";
import { logger } from "@/lib/logger";

const isDev = process.env.NODE_ENV === "development";

let db = new PrismaClient({
  ...(isDev && { log: ["info", "query", "warn", "error"] }),
});

if (isDev) {
  db = db.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = Date.now();

          const result = await query(args);

          const duration = Date.now() - start;

          logger.info(
            "\n[" +
              chalk.bold.dim(`${model}.${operation}`) +
              "] " +
              " -> " +
              JSON.stringify(args, null, 2) +
              chalk.bold.yellow(` took ${duration} ms\n`)
          );

          return result;
        },
      },
    },
  }) as PrismaClient;
}

db = db.$extends({
  query: {
    user: {
      async create({ query, args }) {
        const result = await query(args);

        const user = result as User;

        await enqueueEmail({
          to: user.email,
          url: `${ALLOWED_ORIGINS[0]}/welcome`,
          template: "welcome",
        });

        return result;
      },
    },
  },
}) as PrismaClient;

export { db };

export const connectDB = async () => {
  try {
    await db.$connect();
    logger.info("Database connection established successfully.");
  } catch (err) {
    logger.error("Failed to connect to the database:", err);
    process.exit(1);
  }
};
