/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import passport, { Profile } from "passport";
import { Strategy as GitHubStrategy, StrategyOptions } from "passport-github2";

import { db } from "@/db";
import { User } from "@/generated/prisma";

type SafeUser = Omit<User, "password" | "verifiedAt" | "lastLogin">;

type VerifyCallback = (
  err?: Error | null | unknown,
  user?: SafeUser | false,
  info?: object
) => void;

const opts = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ["user:email"],
} satisfies StrategyOptions;

const typedVerify = (
  fn: (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void
) => fn;

passport.use(
  new GitHubStrategy(
    opts,
    typedVerify(async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value!;

      let user = await db.user.findUnique({
        where: { email },
        omit: {
          password: true,
          verifiedAt: true,
          lastLogin: true,
        },
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
              provider: "github",
            },
          },
          Profile: {
            create: {
              name,
              avatarUrl,
            },
          },
        },
        omit: {
          password: true,
          verifiedAt: true,
          lastLogin: true,
        },
      });

      return done(null, user);
    })
  )
);
