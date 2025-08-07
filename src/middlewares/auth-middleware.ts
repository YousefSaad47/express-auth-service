import { RequestHandler } from "express";

import { StatusCodes } from "http-status-codes";
import passport from "passport";

import { db } from "@/db";
import { Role } from "@/generated/prisma";
import { UnauthorizedError } from "@/lib/errors/http-errors";
import { verifyJWT } from "@/lib/utils/auth";

export const authorizeRole = (...roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.currUser;

    if (user && !roles.includes(user.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Unauthorized" });
    }

    next();
  };
};

export const requireJwt = (): RequestHandler[] => {
  return [
    passport.authenticate("jwt", {
      session: false,
      assignProperty: "currUser",
    }),
    async (req, res, next) => {
      const refreshToken = req.signedCookies.refresh_token;

      if (!refreshToken) {
        throw new UnauthorizedError("No refresh token provided");
      }

      const payload = await verifyJWT(refreshToken);

      if (!payload) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const revokedToken = await db.revokedToken.findUnique({
        where: {
          jti_token: {
            jti: payload.jti!,
            token: refreshToken,
          },
        },
      });

      if (revokedToken) {
        throw new UnauthorizedError("Refresh token has been revoked");
      }

      next();
    },
  ];
};
