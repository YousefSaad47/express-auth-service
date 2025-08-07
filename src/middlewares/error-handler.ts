/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";

import { db } from "@/db";
import { cleanupWorker, emailWorker } from "@/lib/bullmq/workers";
import { ApiError } from "@/lib/errors/api-error";
import { InternalServerError, NotFoundError } from "@/lib/errors/http-errors";
import { logger } from "@/lib/logger";

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  await Promise.all([
    db.$connect(),
    emailWorker.close(),
    cleanupWorker.close(),
  ]);

  process.exit(0);
};

export abstract class ErrorHandler {
  static handleGlobalErrors(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) {
    let apiError: ApiError;

    if (err instanceof ApiError) {
      apiError = err;
    } else {
      apiError = new InternalServerError("unknown_error", err.message, {
        originalError: err,
      });
    }

    if (apiError.isOperational) {
      logger.warn("Operational Error: ", {
        error: {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details,
        },
      });
    } else {
      logger.error("Non-Operational Error: ", {
        error: {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details,
          ...(process.env.NODE_ENV === "development" && {
            stack: apiError.stack,
          }),
        },
      });
    }

    res.status(apiError.statusCode).json({
      error: {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
        details: apiError.details,
        ...(process.env.NODE_ENV === "development" && {
          ...(!apiError.isOperational && { stack: apiError.stack }),
        }),
      },
    });
  }

  static handleNotFoundError(req: Request, _res: Response) {
    throw new NotFoundError("Endpoint not found", {
      url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      method: req.method,
    });
  }

  static registerProcessErrorHandlers() {
    process.on("uncaughtException", (err) => {
      logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("UNHANDLED REJECTION! Shutting down...", reason);
      process.exit(1);
    });

    process.on("SIGINT", async () => {
      await gracefulShutdown("SIGINT");
    });

    process.on("SIGTERM", async () => {
      await gracefulShutdown("SIGTERM");
    });
  }
}
