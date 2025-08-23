import { RequestHandler } from "express";

import passport from "passport";

import { ForbiddenException, UnauthorizedException } from "@/common/exceptions";
import { db } from "@/db";
import { Role } from "@/generated/prisma";
import { verifyJWT } from "@/lib/utils";

export const authorizeRole = (...roles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    const user = req.currUser;

    if (user && !roles.includes(user.role)) {
      throw new ForbiddenException();
    }

    next();
  };
};

export const requireAuth = (): RequestHandler[] => {
  return [
    passport.authenticate("jwt", {
      session: false,
      assignProperty: "currUser",
    }),
    async (req, res, next) => {
      const refreshToken = req.signedCookies.refresh_token;

      if (!refreshToken) {
        throw new UnauthorizedException("No refresh token provided");
      }

      const payload = await verifyJWT(refreshToken);

      if (!payload) {
        throw new UnauthorizedException("Invalid refresh token");
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
        throw new UnauthorizedException("Refresh token has been revoked");
      }

      next();
    },
  ];
};
