/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RequestHandler } from "express";

import { z, ZodError, ZodType } from "zod";

import { ValidationException } from "@/common/exceptions";

type ValidationSchema = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export const validateRequest =
  (schema: ValidationSchema): RequestHandler =>
  async (req, _, next) => {
    try {
      const { body, query, params } = z.object(schema).parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      body && (req.body = body as any);
      query && Object.assign(req.query as any, query);
      params && (req.params = params as any);
    } catch (err) {
      throw new ValidationException("Validation failed", {
        details: z.treeifyError(err as ZodError),
      });
    }

    next();
  };
