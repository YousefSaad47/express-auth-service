import "@/core/env";
import "@/extensions/zod-ext";
import "@/services/strategies";
import "@/lib/bullmq";

import { json, urlencoded } from "express";

import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

import { Server } from "@/core/server";
import { db } from "@/db";
import { csrf } from "@/middlewares/csrf-middleware";
import { rateLimiter } from "@/middlewares/rate-limiter";
import { xssSanitizerBodyQuery } from "@/middlewares/xss-sanitizer";
import { AuthController } from "@/modules/auth/auth-controller";
import { AuthService } from "@/modules/auth/auth-service";

const server = new Server();

const mws = [
  helmet(),
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
  json({ limit: "10mb" }),
  urlencoded({ extended: true, limit: "10mb" }),
  cookieParser(process.env.COOKIE_SECRET),
  compression(),
  rateLimiter,
  xssSanitizerBodyQuery,
  hpp({ whitelist: [] }),
];

if (process.env.NODE_ENV === "development") {
  mws.push(morgan("dev"));
}

const controllers = [new AuthController("/auth", new AuthService(db))];

server
  .registerMiddlewares(mws)
  .registerCSRFHandler()
  .use(csrf)
  .registerControllers(controllers)
  .registerSwagger()
  .registerErrorHandlers()
  .bootstrap();
