import "@/core/env";
import "@/lib/openapi/zod-extend";
import "@/services/stratigies";
import "@/lib/bullmq";

import express from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { redis } from "@/core/redis";
import { Server } from "@/core/server";
import { db } from "@/db";
import { registerPath } from "@/lib/openapi/registery";
import {
  csrf,
  generateCSRF,
  getCSRFRedisKey,
} from "@/middlewares/csrf-middleware";
import { rateLimiter } from "@/middlewares/rate-limiter";
import { xssSanitizerBodyQuery } from "@/middlewares/xss-sanitizer";
import { AuthController } from "@/modules/auth/auth.controller";
import { AuthService } from "@/modules/auth/auth.service";

const server = new Server();

const mws = [
  helmet(),
  cors(),
  express.json({ limit: "10mb" }),
  express.urlencoded({ extended: true, limit: "10mb" }),
  cookieParser(process.env.JWT_ACCESS_SECRET),
  rateLimiter,
  xssSanitizerBodyQuery,
];

if (process.env.NODE_ENV === "development") {
  mws.push(morgan("dev"));
}

const controllers = [new AuthController("/auth", new AuthService(db))];

server.registerMiddlewares(mws);

server.app.get(`${process.env.API_PREFIX}/csrf`, async (req, res) => {
  const csrf = generateCSRF();

  await redis.del(getCSRFRedisKey(req.ip));
  await redis.set(getCSRFRedisKey(req.ip), csrf);

  res.status(200).json({
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

server.app.use(csrf);

server
  .registerControllers(controllers)
  .registerSwagger()
  .registerErrorHandlers()
  .bootstrap();
