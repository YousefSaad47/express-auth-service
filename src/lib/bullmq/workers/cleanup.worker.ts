import { Worker } from "bullmq";

import { redis } from "@/core/redis";
import { db } from "@/db";
import { CLEANUP_QUEUE_NAME } from "@/lib/bullmq/queues/cleanup.queue";

const BATCH_SIZE = 10;

const deleteExpired = async () => {
  let deleted1: number;
  let deleted2: number;
  do {
    const [res1, res2] = await Promise.all([
      db.revokedToken.deleteMany({
        where: { expiresAt: { lte: new Date() } },
        limit: BATCH_SIZE,
      }),
      db.token.deleteMany({
        where: { expiresAt: { lte: new Date() } },
      }),
    ]);

    deleted1 = res1.count;
    deleted2 = res2.count;
  } while (deleted1 === BATCH_SIZE || deleted2 === BATCH_SIZE);
};

export const cleanupWorker = new Worker(
  CLEANUP_QUEUE_NAME,
  async () => {
    await deleteExpired();
  },
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 1000 * 60,
    },
  }
);
