import express, { Express, RequestHandler } from "express";

import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";

import { db } from "@/db";
import { IController } from "@/interfaces/Icontroller";
import { logger } from "@/lib/logger";
import { registry } from "@/lib/openapi/registery";
import { ErrorHandler } from "@/middlewares/error-handler";

export class Server {
  private readonly _app: Express;

  constructor() {
    this._app = express();
  }

  registerMiddlewares(middlewares: RequestHandler[]) {
    this._app.use(...middlewares);
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

  get app() {
    return this._app;
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
}
