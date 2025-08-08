import express, { Express, RequestHandler } from "express";

import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import swaggerUi from "swagger-ui-express";

import { db } from "@/db";
import { IController } from "@/interfaces/controller-interface";
import { logger } from "@/lib/logger";
import { registerPath, registry } from "@/lib/openapi/registry";
import { generateCSRF, getCSRFRedisKey } from "@/middlewares/csrf-middleware";
import { ErrorHandler } from "@/middlewares/error-handler";

import { redis } from "./redis";

export class Server {
  private readonly _app: Express;

  constructor() {
    this._app = express();
  }

  registerMiddlewares(middlewares: RequestHandler[]) {
    this._app.use(...middlewares);
    return this;
  }

  registerCSRFHandler() {
    this.app.use(`${process.env.API_PREFIX}/csrf`, async (req, res) => {
      const csrf = generateCSRF();

      await redis.del(getCSRFRedisKey(req.ip));
      await redis.set(getCSRFRedisKey(req.ip), csrf);

      res.status(StatusCodes.OK).json({
        csrf,
      });
    });

    registerPath({
      tags: ["Auth"],
      method: "get",
      path: `${process.env.API_PREFIX}/csrf`,
      summary: "Generates a new CSRF token",
      statusCode: 200,
      responseDescription: "Returns a new CSRF token",
    });

    return this;
  }

  registerControllers(controllers: IController[]) {
    controllers.forEach((c) =>
      this._app.use(`${process.env.API_PREFIX}${c.path}`, c.router)
    );
    return this;
  }

  registerSwagger() {
    const openapi = new OpenApiGeneratorV31(registry.definitions);
    const docs = openapi.generateDocument({
      info: {
        version: "1.0.0",
        title: "Express Auth Boilerplate",
        description:
          "A boilerplate for building secure and scalable Express applications with authentication, authorization, and OpenAPI documentation",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      openapi: "3.1.0",
    });

    this.app.use(
      `${process.env.API_PREFIX}/docs`,
      swaggerUi.serve,
      swaggerUi.setup(docs)
    );

    return this;
  }

  registerErrorHandlers() {
    this._app.use(ErrorHandler.handleNotFoundError);
    this._app.use(ErrorHandler.handleGlobalErrors);
    ErrorHandler.registerProcessErrorHandlers();
    return this;
  }

  async bootstrap() {
    await this.connectDB();
    this.startServer();
  }

  private startServer() {
    this._app.listen(process.env.PORT, () => {
      logger.info(`Server is running on http://localhost:${process.env.PORT}.`);
    });
  }

  private async connectDB() {
    try {
      await db.$connect();
      logger.info("Database connection established successfully.");
    } catch (err) {
      logger.error("Failed to connect to the database:", err);
      process.exit(1);
    }
  }

  get app() {
    return this._app;
  }

  use(...handler: RequestHandler[]) {
    this._app.use(...handler);
    return this;
  }

  get(path: string, ...handler: RequestHandler[]) {
    this._app.get(path, ...handler);
    return this;
  }

  post(path: string, ...handler: RequestHandler[]) {
    this._app.post(path, ...handler);
    return this;
  }

  put(path: string, ...handler: RequestHandler[]) {
    this._app.put(path, ...handler);
    return this;
  }

  patch(path: string, ...handler: RequestHandler[]) {
    this._app.patch(path, ...handler);
    return this;
  }

  delete(path: string, ...handler: RequestHandler[]) {
    this._app.delete(path, ...handler);
    return this;
  }
}
