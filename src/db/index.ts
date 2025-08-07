import chalk from "chalk";

import { PrismaClient, User } from "@/generated/prisma";
import { enqueueEmail } from "@/lib/bullmq/queues/email.queue";

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

          console.log(
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
          url: "http://localhost:3000",
          template: "welcome",
        });

        return result;
      },
    },
  },
}) as PrismaClient;

export { db };
