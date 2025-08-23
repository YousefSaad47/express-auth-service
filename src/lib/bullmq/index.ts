import "./workers";

import { QueueEvents } from "bullmq";

import { redis } from "@/core/redis";
import { logger } from "@/lib/logger";

import { CLEANUP_QUEUE_NAME } from "./queues/cleanup.queue";
import { EMAIL_QUEUE_NAME } from "./queues/email.queue";

const emailQueueEvents = new QueueEvents(EMAIL_QUEUE_NAME, {
  connection: redis,
});

const cleanupQueueEvents = new QueueEvents(CLEANUP_QUEUE_NAME, {
  connection: redis,
});

const queueEvents = [emailQueueEvents, cleanupQueueEvents];

queueEvents.forEach((e) => {
  e.on("active", ({ jobId }) => {
    logger.info(`queue:${e.name} | job:${jobId} -> started`);
  });

  e.on("completed", ({ jobId }) => {
    logger.info(`queue:${e.name} | job:${jobId} -> completed`);
  });

  e.on("failed", ({ jobId, failedReason }) => {
    logger.error(`queue:${e.name} | job:${jobId} -> failed: ${failedReason}`);
  });

  e.on("error", (err) => {
    logger.error(`queue:${e.name} -> error: ${err}`);
  });
});
