import { Application, json, urlencoded } from "express";

import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
// import helmet from "helmet";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";

import { ForbiddenException } from "@/common/exceptions";
import { IController } from "@/common/interfaces";
import { connectDB } from "@/db";
import { registry } from "@/lib/openapi/registry";
import {
  csrf,
  ErrorHandler,
  globalThrottler,
  xssSanitizerBodyQuery,
} from "@/middlewares";

export const extendExpressApp = (app: Application) => {
  app.registerCors = () => {
    app.use(
      cors({
        origin: (origin, cb) => {
          if (!origin) return cb(null, true); // allow non-browser requests like postman, curl, etc.
          if (process.env.ALLOWED_ORIGINS.includes(origin)) {
            return cb(null, true);
          }

          return cb(
            new ForbiddenException("CORS policy: This origin is not allowed")
          );
        },
        credentials: true,
      })
    );

    return app;
  };

  app.registerSecurity = () => {
    // Will add security headers
    // app.use(helmet());

    // Explicitly
    app.use((req, res, next) => {
      res.removeHeader("X-Powered-By");

      res.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );

      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; upgrade-insecure-requests"
      );

      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("X-Frame-Options", "DENY");

      res.setHeader(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()"
      );

      res.setHeader(
        "Referrer-Policy",
        // Disable referrers for browsers that don't support strict-origin-when-cross-origin; use strict-origin-when-cross-origin for browsers that do:
        "no-referrer, strict-origin-when-cross-origin"
      );

      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Origin-Agent-Cluster", "?1");
      res.setHeader("X-DNS-Prefetch-Control", "off");
      res.setHeader("X-Download-Options", "noopen");
      res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

      next();
    });

    return app;
  };

  app.registerParsers = () => {
    app.use(json({ limit: "10mb" }));
    app.use(urlencoded({ extended: true, limit: "10mb" }));
    app.use(cookieParser(process.env.COOKIE_SECRET));

    return app;
  };

  app.registerThrottler = () => {
    app.use(globalThrottler);
    return app;
  };

  app.registerCompression = () => {
    app.use(compression());
    return app;
  };

  app.registerSanitizers = () => {
    app.use(xssSanitizerBodyQuery);
    // Prevent HTTP Parameter Pollution
    app.use(hpp({ whitelist: [] }));
    return app;
  };

  app.registerCSRF = () => {
    app.use(
      csrf({
        secFetchSite(secFetchSite, req) {
          if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
            return true;
          }

          if (
            secFetchSite === "cross-site" &&
            process.env.ALLOWED_ORIGINS.includes(req.headers.origin!)
          ) {
            return true;
          }

          return false;
        },
      })
    );

    return app;
  };

  app.registerControllers = (controllers: IController[]) => {
    controllers.forEach((c) =>
      app.use(`${process.env.API_PREFIX}${c.path}`, c.router)
    );
    return app;
  };

  app.registerSwagger = () => {
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

    app.use(
      `${process.env.API_PREFIX}/docs`,
      swaggerUi.serve,
      swaggerUi.setup(docs)
    );

    return app;
  };

  app.registerErrorHandlers = () => {
    app.use(ErrorHandler.handleNotFoundError);
    app.use(ErrorHandler.handleGlobalErrors);
    ErrorHandler.registerProcessErrorHandlers();
    return app;
  };

  app.bootstrap = async () => {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  };
};
