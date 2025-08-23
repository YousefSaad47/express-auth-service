import "@/core/env";
import "@/common/extensions/zod.ext";
import "@/services/strategies";
import "@/lib/bullmq";
import "@/services/sentry/instrument";

import express from "express";

import * as Sentry from "@sentry/node";
import morgan from "morgan";
import ms from "ms";

import { extendExpressApp } from "@/common/extensions";
import { responseExtension } from "@/common/extensions/response.ext";
import { db } from "@/db";
import { requestId, timeout } from "@/middlewares";
import { AuthController, AuthService } from "@/modules/auth";

const app = express();

Sentry.setupExpressErrorHandler(app);

extendExpressApp(app);

app.use(responseExtension);

const controllers = [new AuthController("/auth", new AuthService(db))];

app.use(requestId());
app.set("etag", true);
app.use(timeout(ms(process.env.REQUEST_TIMEOUT)));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app
  .registerSecurity()
  .registerCors()
  .registerParsers()
  .registerCompression()
  .registerThrottler()
  .registerSanitizers()
  .registerCSRF()
  .registerControllers(controllers)
  .registerSwagger()
  .registerErrorHandlers()
  .bootstrap();
