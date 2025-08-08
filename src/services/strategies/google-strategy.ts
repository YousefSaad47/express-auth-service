/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import passport from "passport";
import {
  Strategy as GoogleStrategy,
  StrategyOptions,
} from "passport-google-oauth20";

import { db } from "@/db";

const opts = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ["profile", "email"],
} satisfies StrategyOptions;

passport.use(
  new GoogleStrategy(opts, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value!;

    let user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      return done(null, user);
    }

    const name = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value;

    user = await db.user.create({
      data: {
        email,
        lastLogin: new Date(),
        verifiedAt: new Date(),
        Account: {
          create: {
            type: "oauth",
            provider: "google",
          },
        },
        Profile: {
          create: {
            name,
            avatarUrl,
          },
        },
      },
    });

    return done(null, user);
  })
);
