/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  sendDefaultPii: true,
});

export const logToSentry = (err: any, level: Sentry.SeverityLevel) => {
  Sentry.captureException(err, {
    level,
  });
};
