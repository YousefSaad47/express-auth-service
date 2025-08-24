/* eslint-disable @typescript-eslint/no-explicit-any */

import { randomInt, randomUUID } from "crypto";
import { promisify } from "util";

import { Response } from "express";

import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import ms, { StringValue } from "ms";

export const generateJWT = async (
  userId: string,
  expiresIn: StringValue
): Promise<string> => {
  return await promisify(jwt.sign as any)(
    { jti: randomUUID(), sub: userId },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn,
    }
  );
};

export const verifyJWT = async (token: string): Promise<JwtPayload | null> => {
  try {
    return await promisify(jwt.verify as any)(
      token,
      process.env.JWT_ACCESS_SECRET
    );
  } catch {
    return null;
  }
};

export const setCookie = (
  res: Response,
  token: string,
  type: "access_token" | "refresh_token"
) => {
  switch (type) {
    case "access_token":
      res.cookie("access_token", token, {
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ms(process.env.JWT_ACCESS_EXPIRATION),
      });
      break;
    case "refresh_token":
      res.cookie("refresh_token", token, {
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ms(process.env.JWT_REFRESH_EXPIRATION),
      });
      break;
    default:
      break;
  }
};

export const revokeTokenReasons = {
  USER_LOGOUT: "User logged out",
  PASSWORD_CHANGE: "Password changed",
  ACCOUNT_DELETION: "Account deleted",
  REFRESH_TOKEN_ROTATION: "Refresh token rotation",
};

export const generateOTP = async () => {
  const otp = randomInt(100000, 999999).toString();

  const expiresAt = new Date(Date.now() + ms(process.env.OTP_EXPIRATION));

  const otpHash = await bcrypt.hash(
    otp,
    Number(process.env.BCRYPT_SALT_ROUNDS)
  );
  return { otp, otpHash, expiresAt };
};

export const generateToken = async () => {
  const token = randomUUID();

  const expiresAt = new Date(
    Date.now() + ms(process.env.MAGIC_LINK_EXPIRATION)
  );
  const tokenHash = await bcrypt.hash(
    token,
    Number(process.env.BCRYPT_SALT_ROUNDS)
  );

  return { token, tokenHash, expiresAt };
};

export const verifyToken = async (token: string, tokenHash: string) => {
  return await bcrypt.compare(token, tokenHash);
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));
};

export const verifyPassword = verifyToken;

export const verifyCaptcha = async (token: string, ip: string) => {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    }
  );

  const data = await res.json();

  return data as {
    success: boolean;
  };
};
