/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Sentry from "@sentry/node";

export const logToSentry = (err: any, level: Sentry.SeverityLevel) => {
  Sentry.captureException(err, { level });
};
