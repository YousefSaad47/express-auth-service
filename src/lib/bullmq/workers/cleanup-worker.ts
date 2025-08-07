import { Worker } from "bullmq";

import { redis } from "@/core/redis";
import { db } from "@/db";
import { CLEANUP_QUEUE_NAME } from "@/lib/bullmq/queues/cleanup-queue";

const BATCH_SIZE = 10;

const deleteExpired = async () => {
  let deleted: number;
  do {
    const result = await db.revokedToken.deleteMany({
      where: { expiresAt: { lte: new Date() } },
      limit: BATCH_SIZE,
    });

    deleted = result.count;
  } while (deleted === BATCH_SIZE);
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
