import { Request } from "express";

import { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithoutRequest,
} from "passport-jwt";

import { db } from "@/db";

const cookieExtractor = (req: Request) => {
  let token;

  if (req && req.cookies) {
    token = req.signedCookies["access_token"];
  }

  return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: process.env.JWT_ACCESS_SECRET,
} satisfies StrategyOptionsWithoutRequest;

passport.use(
  new JwtStrategy(opts, async (payload: JwtPayload, done) => {
    let user;
    try {
      user = await db.user.findUnique({ where: { id: payload.sub } });
    } catch (err) {
      return done(err, false);
    }

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  })
);
