import { RequestHandler } from "express";

import { GatewayTimeoutException } from "@/common/exceptions";

export const timeout = (ms: number): RequestHandler => {
  const err = new GatewayTimeoutException();

  return (req, res, next) => {
    const timer = setTimeout(() => {
      res.status(err.statusCode).json(err.toJSON(req.id));
    }, ms);

    res.on("finish", () => {
      clearTimeout(timer);
    });

    res.on("close", () => {
      clearTimeout(timer);
    });

    const originalJson = res.json.bind(res);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json = (...args: any) => {
      // Do not send the response if headers are already sent
      if (res.headersSent) return res;
      return originalJson(...args);
    };

    next();
  };
};
