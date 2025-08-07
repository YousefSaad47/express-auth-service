import { Queue } from "bullmq";
import ms from "ms";

import { redis } from "@/core/redis";

export const CLEANUP_QUEUE_NAME = "cleanup";

export const cleanupQueue = new Queue(CLEANUP_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: {
      age: ms("1d") / 1000,
    },
  },
});

const cleanupSchedule = async () => {
  await cleanupQueue.upsertJobScheduler(
    "cleanup-daily",
    {
      pattern: "0 0 0 * * *",
    },
    {
      name: "cleanup-job-scheduler",
    }
  );
};

(async () => {
  await cleanupSchedule();
})();
