import { Queue } from "bullmq";
import ms from "ms";

import { redis } from "@/core/redis";
import { EmailTemplate } from "@/lib/utils/email/templates";

export type EmailJobData = {
  to: string;
  url: string;
  template: EmailTemplate;
};

export const EMAIL_QUEUE_NAME = "email";

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: {
      age: ms("1d") / 1000,
    },
  },
});

export const enqueueEmail = async (data: EmailJobData) => {
  await emailQueue.add("send-email", data);
};
