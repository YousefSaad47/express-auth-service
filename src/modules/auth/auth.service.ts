import { Prisma, PrismaClient } from "@/generated/prisma";
import { enqueueEmail } from "@/lib/bullmq/queues/email.queue";
import { ErrorCodes } from "@/lib/errors/error-codes";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors/http-errors";
import {
  generateOTP,
  generateToken,
  hashPassword,
  verifyCaptcha,
  verifyPassword,
  verifyToken,
} from "@/lib/utils/auth";
import { generateInitialsAvatar } from "@/lib/utils/avatar";
import { omit } from "@/lib/utils/omit";
import {
  getSignInAttemptsRedisKey,
  incrementSignInAttempts,
  resetSignInAttempts,
} from "@/middlewares/signin-attempt-limiter";

import { SignInBody, SignUpBody } from "./auth.validation";

export class AuthService {
  constructor(private readonly db: PrismaClient) {}

  async signUp(body: SignUpBody) {
    const { name, email, password } = body;
    const hashedPassword = await hashPassword(password);
    const avatarUrl = generateInitialsAvatar(name);

    try {
      const user = await this.db.user.create({
        data: {
          email,
          password: hashedPassword,
          lastLogin: new Date(),
          Account: { create: { type: "credentials", provider: "credentials" } },
          Profile: { create: { name, avatarUrl } },
        },
        include: {
          Profile: { omit: { userId: true } },
          Account: { omit: { userId: true, type: true } },
        },
        omit: {
          password: true,
          verifiedAt: true,
          role: true,
        },
      });

      return user;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Email already in use");
      }

      throw err;
    }
  }

  async signIn(body: SignInBody, signInAttempts: number, ip: string) {
    const { email, password, captchaToken } = body;

    const signInAttemptsKey = getSignInAttemptsRedisKey(ip);

    if (signInAttempts! > 3) {
      if (!captchaToken) {
        await incrementSignInAttempts(signInAttemptsKey);
        throw new BadRequestError("Captcha token is required", {
          requireCaptcha: true,
        });
      }

      const captchaRes = await verifyCaptcha(captchaToken, ip);

      if (!captchaRes.success) {
        await incrementSignInAttempts(signInAttemptsKey);
        throw new BadRequestError("Invalid captcha token");
      }
    }

    const user = await this.findUserByEmail(email);

    if (!user) {
      await incrementSignInAttempts(signInAttemptsKey);
      throw new BadRequestError("Invalid email or password");
    }

    if (!user.password) {
      throw new BadRequestError(
        "This account uses OAuth. Sign in with Google/GitHub or set a password to enable email login"
      );
    }

    if (!(await verifyPassword(password, user.password))) {
      await incrementSignInAttempts(signInAttemptsKey);
      throw new BadRequestError("Invalid email or password");
    }

    if (!user.verifiedAt) {
      await this.requestEmailVerification(user.email);

      throw new BadRequestError(
        "Email not verified. Please check your inbox for the verification email"
      );
    }

    await resetSignInAttempts(signInAttemptsKey);

    const safeUser = omit(user, "password");

    return safeUser;
  }

  async requestOTP(email: string) {
    const user = await this.findUserByEmail(email, {
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundError("No user found with this email");
    }

    const { otp, otpHash, expiresAt } = await generateOTP();

    await this.db.token.upsert({
      where: {
        email_type: {
          email,
          type: "otp",
        },
      },
      create: {
        email,
        type: "otp",
        token: otpHash,
        expiresAt: new Date(expiresAt),
      },
      update: {
        token: otpHash,
        expiresAt: new Date(expiresAt),
      },
    });

    await enqueueEmail({
      to: user.email,
      url: otp,
      template: "otp",
    });
  }

  async verifyOTP(email: string, otp: string) {
    const otpToken = await this.db.token.findUnique({
      where: {
        email_type: {
          email,
          type: "otp",
        },
      },
    });

    if (!otpToken) {
      throw new NotFoundError("No OTP token found for this email");
    }

    if (otpToken.expiresAt < new Date()) {
      throw new BadRequestError(
        "OTP token has expired",
        undefined,
        ErrorCodes.TOKEN_EXPIRED
      );
    }

    const isValid = await verifyToken(otp, otpToken.token);

    if (!isValid) {
      throw new BadRequestError(
        "Invalid OTP token",
        undefined,
        ErrorCodes.TOKEN_INVALID
      );
    }

    await this.db.token.delete({
      where: {
        id: otpToken.id,
      },
    });
  }

  async requestMagicLink(email: string) {
    const user = await this.findUserByEmail(email, {
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundError("No user found with this email");
    }

    const { token, tokenHash, expiresAt } = await generateToken();

    await this.db.token.upsert({
      where: {
        email_type: {
          email,
          type: "magic_link",
        },
      },
      create: {
        email,
        type: "magic_link",
        token: tokenHash,
        expiresAt: new Date(expiresAt),
      },
      update: {
        token: tokenHash,
        expiresAt: new Date(expiresAt),
      },
    });

    await enqueueEmail({
      to: user.email,
      url: `http://localhost:3000/auth/magic-link/verify?token=${token}`,
      template: "magicLink",
    });
  }

  async verifyMagicLink(email: string, token: string) {
    const magicLinkToken = await this.db.token.findUnique({
      where: {
        email_type: {
          email,
          type: "magic_link",
        },
      },
    });

    if (!magicLinkToken) {
      throw new NotFoundError("No magic link token found for this email");
    }

    if (magicLinkToken.expiresAt < new Date()) {
      throw new BadRequestError(
        "Magic link token has expired",
        undefined,
        ErrorCodes.TOKEN_EXPIRED
      );
    }

    const isValid = await verifyToken(token, magicLinkToken.token);

    if (!isValid) {
      throw new BadRequestError(
        "Invalid magic link token",
        undefined,
        ErrorCodes.TOKEN_INVALID
      );
    }

    await this.db.token.delete({
      where: {
        id: magicLinkToken.id,
      },
    });
  }

  async requestEmailVerification(email: string) {
    const user = await this.findUserByEmail(email, {
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundError("No user found with this email");
    }

    const { token, tokenHash, expiresAt } = await generateToken();

    await this.db.token.upsert({
      where: {
        email_type: {
          email,
          type: "email_verification",
        },
      },
      create: {
        email,
        type: "email_verification",
        token: tokenHash,
        expiresAt: new Date(expiresAt),
      },
      update: {
        token: tokenHash,
        expiresAt: new Date(expiresAt),
      },
    });

    await enqueueEmail({
      to: user.email,
      url: `http://localhost:3000/auth/verify-email?token=${token}`,
      template: "emailVerification",
    });
  }

  async verifyEmailVerification(email: string, token: string) {
    await this.db.$transaction(async (tx) => {
      const emailVerificationToken = await tx.token.findUnique({
        where: {
          email_type: {
            email,
            type: "email_verification",
          },
        },
      });

      if (!emailVerificationToken) {
        throw new NotFoundError(
          "No email verification token found for this email"
        );
      }

      if (emailVerificationToken.expiresAt < new Date()) {
        throw new BadRequestError(
          "Email verification token has expired",
          undefined,
          ErrorCodes.TOKEN_EXPIRED
        );
      }

      const isValid = await verifyToken(token, emailVerificationToken.token);

      if (!isValid) {
        throw new BadRequestError(
          "Invalid email verification token",
          undefined,
          ErrorCodes.TOKEN_INVALID
        );
      }

      await tx.user.update({
        where: { email },
        data: { verifiedAt: new Date() },
      });

      await tx.token.delete({
        where: {
          id: emailVerificationToken.id,
        },
      });
    });
  }

  async forgetPassword(email: string) {
    const user = await this.findUserByEmail(email, {
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundError("No user found with this email");
    }

    const { token, tokenHash, expiresAt } = await generateToken();

    await this.db.token.upsert({
      where: {
        email_type: {
          email,
          type: "password_reset",
        },
      },
      create: {
        email,
        type: "password_reset",
        token: tokenHash,
        expiresAt: new Date(expiresAt),
      },
      update: {
        token: tokenHash,
        expiresAt: new Date(expiresAt),
      },
    });

    await enqueueEmail({
      to: user.email,
      url: `http://localhost:3000/auth/reset-password?token=${token}`,
      template: "resetPassword",
    });
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    await this.db.$transaction(async (tx) => {
      const passwordResetToken = await tx.token.findUnique({
        where: {
          email_type: {
            email,
            type: "password_reset",
          },
        },
      });

      if (!passwordResetToken) {
        throw new NotFoundError("No password reset token found for this email");
      }

      if (passwordResetToken.expiresAt < new Date()) {
        throw new BadRequestError(
          "Password reset token has expired",
          undefined,
          ErrorCodes.TOKEN_EXPIRED
        );
      }

      const isValid = await verifyToken(token, passwordResetToken.token);

      if (!isValid) {
        throw new BadRequestError(
          "Invalid password reset token",
          undefined,
          ErrorCodes.TOKEN_INVALID
        );
      }

      const hashedNewPassword = await hashPassword(newPassword);

      await tx.user.update({
        where: { email },
        data: { password: hashedNewPassword },
      });

      await tx.token.delete({
        where: {
          id: passwordResetToken.id,
        },
      });
    });
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.findUserById(userId, {
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.password) {
      throw new BadRequestError(
        "This account uses OAuth. Set a password to enable email login"
      );
    }

    if (!(await verifyPassword(currentPassword, user.password!))) {
      throw new BadRequestError("Invalid current password");
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError(
        "New password must be different from current password"
      );
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await this.db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });
  }

  async findUserByEmail(
    email: string,
    { select }: { select?: Prisma.UserSelect } = { select: undefined }
  ) {
    const user = await this.db.user.findUnique({
      where: { email },
      select,
    });
    return user;
  }

  async findUserById(
    userId: string,
    { select }: { select?: Prisma.UserSelect } = { select: undefined }
  ) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select,
    });

    return user;
  }

  async revokeToken(
    { jti, token, expiresAt }: { jti: string; token: string; expiresAt: Date },
    reason?: string
  ) {
    try {
      await this.db.revokedToken.create({
        data: {
          jti,
          token,
          expiresAt,
          reason,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Token already revoked");
      }
      throw err;
    }
  }

  async isTokenRevoked(jti: string, token: string) {
    const revokedToken = await this.db.revokedToken.findUnique({
      where: { jti_token: { jti, token } },
    });
    return !!revokedToken;
  }
}
