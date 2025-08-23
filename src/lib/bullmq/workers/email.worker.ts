import { Worker } from "bullmq";

import { redis } from "@/core/redis";
import {
  EMAIL_QUEUE_NAME,
  EmailJobData,
} from "@/lib/bullmq/queues/email.queue";
import { sendEmail } from "@/lib/utils/email";
import { emailTemplates } from "@/lib/utils/email/templates";

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job) => {
    const { to, url, template } = job.data;
    const { render, subject } = emailTemplates[template];

    const { html, text } = await render(to, url);

    await sendEmail({
      to,
      subject,
      html,
      text,
    });
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
