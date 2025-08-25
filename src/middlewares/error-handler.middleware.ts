import { ErrorRequestHandler, Request, Response } from "express";

import chalk from "chalk";

import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@/common/exceptions";
import { db } from "@/db";
import { PrismaErrorMap } from "@/db/prisma-error.map";
import { Prisma } from "@/generated/prisma";
import { cleanupWorker, emailWorker } from "@/lib/bullmq/workers";
import { logger } from "@/lib/logger";
import { logToSentry } from "@/services/sentry";

const gracefulShutdown = async (sig: string) => {
  logger.info(`Received ${sig}. Shutting down gracefully...`);

  await Promise.all([
    db.$disconnect(),
    emailWorker.close(),
    cleanupWorker.close(),
  ]);

  process.exit(0);
};

export abstract class ErrorHandler {
  static handleGlobalErrors: ErrorRequestHandler = (err, req, res, _next) => {
    let httpError: HttpException;

    if (err instanceof HttpException) {
      httpError = err;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const mappedError = PrismaErrorMap.get(err.code);
      httpError = mappedError?.exception(err) as HttpException;
    } else {
      httpError = new InternalServerErrorException(err.message);
    }

    if (httpError.isFatal) {
      logToSentry(httpError, "fatal");
      logger.error(chalk.bold.red("FATAL_ERROR"), {
        error: {
          ...httpError.toJSON().error,
          ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
          }),
        },
        meta: httpError.toJSON(req.id).meta,
      });
    } else {
      logToSentry(httpError, "warning");
      logger.warn(
        chalk.bold.yellow("NON_FATAL_ERROR"),
        httpError.toJSON(req.id)
      );
    }

    res.status(httpError.statusCode).json({
      error: {
        ...httpError.toJSON().error,
        ...(process.env.NODE_ENV === "development" && {
          ...(httpError.isFatal && { stack: err.stack }),
        }),
      },
      meta: httpError.toJSON(req.id).meta,
    });
  };

  static handleNotFoundError(req: Request, _res: Response) {
    throw new NotFoundException("Endpoint not found", {
      details: {
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        method: req.method,
      },
    });
  }

  static registerProcessErrorHandlers() {
    process.on("uncaughtException", (err) => {
      logToSentry(err, "fatal");
      logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      logToSentry(reason, "fatal");
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
