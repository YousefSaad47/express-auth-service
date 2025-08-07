/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { RequestHandler, Router } from "express";

import { StatusCodes } from "http-status-codes";
import passport from "passport";

import { IController } from "@/interfaces/Icontroller";
import { UnauthorizedError } from "@/lib/errors/http-errors";
import { registerPath } from "@/lib/openapi/registery";
import {
  generateJWT,
  revokeTokenReasons,
  setCookie,
  verifyJWT,
} from "@/lib/utils/auth";
import { requireJwt } from "@/middlewares/auth-middleware";
import { signInAttemptsLimiter } from "@/middlewares/signin-attempt-limiter";
import { validateRequest } from "@/middlewares/validation-middleware";

import { AuthService } from "./auth.service";
import {
  csrfHeaderSchema,
  ForgetPasswordBody,
  forgetPasswordBodySchema,
  RequestEmailVerificationBody,
  requestEmailVerificationBodySchema,
  RequestMagicLinkBody,
  requestMagicLinkBodySchema,
  RequestOTPBody,
  requestOTPBodySchema,
  ResetPasswordBody,
  resetPasswordBodySchema,
  ResetPasswordQuery,
  resetPasswordQuerySchema,
  SignInBody,
  signInBodySchema,
  SignUpBody,
  signUpBodySchema,
  UpdatePasswordBody,
  updatePasswordBodySchema,
  VerifyEmailVerificationBody,
  verifyEmailVerificationBodySchema,
  VerifyEmailVerificationQuery,
  verifyEmailVerificationQuerySchema,
  VerifyMagicLinkBody,
  verifyMagicLinkBodySchema,
  VerifyMagicLinkQuery,
  verifyMagicLinkQuerySchema,
  VerifyOTPBody,
  verifyOTPBodySchema,
} from "./auth.validation";

export class AuthController implements IController {
  router: Router;
  constructor(
    public readonly path: string,
    private readonly service: AuthService
  ) {
    this.router = Router();
    this.initializeRoutes();
    this.registerOpenApi();
  }

  private registerOpenApi() {
    const openApiPathPrefix = `${process.env.API_PREFIX}${this.path}`;

    // GET /google
    registerPath({
      tags: ["Auth"],
      method: "get",
      path: `${openApiPathPrefix}/google`,
      summary: "Redirects to Google OAuth",
      authType: "GoogleOAuth",
      statusCode: StatusCodes.MOVED_TEMPORARILY,
      responseDescription: "Redirects to Google OAuth",
    });

    // GET /google/callback
    registerPath({
      tags: ["Auth"],
      method: "get",
      path: `${openApiPathPrefix}/google/callback`,
      summary: "Handles Google OAuth callback and signs in user",
      authType: "GoogleOAuth",
      statusCode: StatusCodes.NO_CONTENT,
      responseDescription: "Successfully authenticated via Google OAuth",
    });

    // GET /github
    registerPath({
      tags: ["Auth"],
      method: "get",
      path: `${openApiPathPrefix}/github`,
      summary: "Redirects to GitHub OAuth",
      authType: "GitHubOAuth",
      statusCode: StatusCodes.MOVED_TEMPORARILY,
      responseDescription: "Redirects to GitHub OAuth",
    });

    // GET /github/callback
    registerPath({
      tags: ["Auth"],
      method: "get",
      path: `${openApiPathPrefix}/github/callback`,
      summary: "Handles GitHub OAuth callback and signs in user",
      authType: "GitHubOAuth",
      statusCode: StatusCodes.NO_CONTENT,
      responseDescription: "Successfully authenticated via GitHub OAuth",
    });

    // POST /signup
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/signup`,
      summary: "Registers a new user",
      bodySchema: signUpBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.CREATED,
      responseDescription: "User successfully registered",
    });

    // POST /signin
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/signin`,
      summary: "Signs in a user with credentials",
      bodySchema: signInBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.NO_CONTENT,
      responseDescription: "User successfully signed in",
    });

    // DELETE /signout
    registerPath({
      tags: ["Auth"],
      method: "delete",
      path: `${openApiPathPrefix}/signout`,
      summary: "Signs out a user",
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.NO_CONTENT,
      responseDescription: "User successfully signed out",
    });

    // POST /otp
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/otp`,
      summary: "Requests an OTP for authentication",
      bodySchema: requestOTPBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "OTP sent to the user",
    });

    // POST /otp/verify
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/otp/verify`,
      summary: "Verifies an OTP for authentication",
      bodySchema: verifyOTPBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "OTP verified successfully",
    });

    // POST /magic-link
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/magic-link`,
      summary: "Requests a magic link for authentication",
      bodySchema: requestMagicLinkBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "Magic link sent to the user",
    });

    // POST /magic-link/verify
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/magic-link/verify`,
      summary: "Verifies a magic link for authentication",
      bodySchema: verifyMagicLinkBodySchema,
      querySchema: verifyMagicLinkQuerySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "Magic link verified successfully",
    });

    // POST /email-verification
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/email-verification`,
      summary: "Requests an email verification token",
      bodySchema: requestEmailVerificationBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "Email verification token sent",
    });

    // POST /email/verify
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/email/verify`,
      summary: "Verifies an email verification token",
      bodySchema: verifyEmailVerificationBodySchema,
      querySchema: verifyEmailVerificationQuerySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "Email verified successfully",
    });

    // POST /password/forget
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/password/forget`,
      summary: "Requests a password reset link",
      bodySchema: forgetPasswordBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "Password reset link sent",
    });

    // POST /password/reset
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/password/reset`,
      summary: "Resets a user's password",
      bodySchema: resetPasswordBodySchema,
      querySchema: resetPasswordQuerySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.OK,
      responseDescription: "Password reset successfully",
    });

    // PATCH /password
    registerPath({
      tags: ["Auth"],
      method: "patch",
      path: `${openApiPathPrefix}/password`,
      summary: "Updates a user's password",
      authType: "bearerAuth",
      bodySchema: updatePasswordBodySchema,
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.NO_CONTENT,
      responseDescription: "Password updated successfully",
    });

    // POST /refresh
    registerPath({
      tags: ["Auth"],
      method: "post",
      path: `${openApiPathPrefix}/refresh`,
      summary: "Refreshes a user's access token",
      headersSchema: csrfHeaderSchema,
      statusCode: StatusCodes.NO_CONTENT,
      responseDescription: "Access token refreshed successfully",
    });
  }

  private initializeRoutes() {
    this.router
      .get("/google", passport.authenticate("google"))
      .get(
        "/google/callback",
        passport.authenticate("google", {
          failureRedirect: "/",
          session: false,
        }),
        this.signInWithOauth
      )
      .get("/github", passport.authenticate("github"))
      .get(
        "/github/callback",
        passport.authenticate("github", {
          failureRedirect: "/",
          session: false,
        }),
        this.signInWithOauth
      )
      .post("/signup", validateRequest({ body: signUpBodySchema }), this.signUp)
      .post(
        "/signin",
        signInAttemptsLimiter,
        validateRequest({ body: signInBodySchema }),
        this.signInWithCredentials
      )
      .delete("/signout", this.signOut)
      .post(
        "/otp",
        validateRequest({ body: requestOTPBodySchema }),
        this.requestOTP
      )
      .post(
        "/otp/verify",
        validateRequest({ body: verifyOTPBodySchema }),
        this.verifyOTP
      )
      .post(
        "/magic-link",
        validateRequest({ body: requestMagicLinkBodySchema }),
        this.requestMagicLink
      )
      .post(
        "/magic-link/verify",
        validateRequest({
          body: verifyMagicLinkBodySchema,
          query: verifyMagicLinkQuerySchema,
        }),
        this.verifyMagicLink
      )
      .post(
        "/email-verification",
        validateRequest({ body: requestEmailVerificationBodySchema }),
        this.requestEmailVerification
      )
      .post(
        "/email/verify",
        validateRequest({
          body: verifyEmailVerificationBodySchema,
          query: verifyEmailVerificationQuerySchema,
        }),
        this.verifyEmailVerification
      )
      .post(
        "/password/forget",
        validateRequest({ body: forgetPasswordBodySchema }),
        this.forgetPassword
      )
      .post(
        "/password/reset",
        validateRequest({
          body: resetPasswordBodySchema,
          query: resetPasswordQuerySchema,
        }),
        this.resetPassword
      )
      .patch(
        "/password",
        requireJwt(),
        validateRequest({ body: updatePasswordBodySchema }),
        this.updatePassword
      )
      .post("/refresh", this.refresh);
  }

  private signInWithOauth: RequestHandler = async (req, res) => {
    const existingAccessToken = req.signedCookies.access_token;

    /**
     * SameSite: should be 'lax' instead of 'strict'
     *
     * In an OAuth flow (like Google/GitHub login), the user is redirected to an external
     * provider and then back to our app. This redirection is considered a *cross-site* navigation.
     *
     * If we set `SameSite: 'strict'`, the browser will reject setting or sending cookies
     * during that cross-site redirect, causing issues like:
     *
     *   - Access token cookie not being stored
     *   - User appearing as unauthenticated even after successful OAuth
     *
     * To fix this, we use `SameSite: 'lax'`, which allows cookies to be sent on top-level
     * navigations (like OAuth redirects) while still protecting against CSRF in most cases.
     */

    if (existingAccessToken) {
      const payload = await verifyJWT(existingAccessToken);

      if (payload) {
        return res.status(StatusCodes.OK).json({
          message: "Already signed in",
        });
      }
    }

    const user = req.currUser;

    const accessToken = await generateJWT(
      user?.id!,
      process.env.JWT_ACCESS_EXPIRATION
    );

    const refreshToken = await generateJWT(
      user?.id!,
      process.env.JWT_REFRESH_EXPIRATION
    );

    setCookie(res, accessToken, "access_token");
    setCookie(res, refreshToken, "refresh_token");

    res.status(StatusCodes.NO_CONTENT).end();
  };

  private signUp: RequestHandler<unknown, unknown, SignUpBody> = async (
    req,
    res
  ) => {
    const { name, email, password } = req.body;

    const user = await this.service.signUp({
      name,
      email,
      password,
    });

    res.status(StatusCodes.CREATED).json({
      user,
    });
  };

  private signInWithCredentials: RequestHandler<unknown, unknown, SignInBody> =
    async (req, res) => {
      const existingAccessToken = req.signedCookies.access_token;

      if (existingAccessToken) {
        const payload = await verifyJWT(existingAccessToken);

        if (payload) {
          return res.status(StatusCodes.OK).json({
            message: "Already signed in",
          });
        }
      }

      const body = req.body;
      const signInAttempts = req.signInAttempts!;
      const ip = req.ip!;

      const user = await this.service.signIn(body, signInAttempts, ip);

      const accessToken = await generateJWT(
        user.id,
        process.env.JWT_ACCESS_EXPIRATION
      );

      const refreshToken = await generateJWT(
        user.id,
        process.env.JWT_REFRESH_EXPIRATION
      );

      setCookie(res, accessToken, "access_token");
      setCookie(res, refreshToken, "refresh_token");

      res.status(StatusCodes.NO_CONTENT).end();
    };

  private signOut: RequestHandler = async (req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const refreshToken = req.signedCookies.refresh_token;

    if (!refreshToken) {
      return res.status(StatusCodes.OK).json({ message: "Already signed out" });
    }

    const payload = await verifyJWT(refreshToken);

    if (payload) {
      await this.service.revokeToken(
        {
          jti: payload.jti!,
          token: refreshToken,
          expiresAt: new Date(payload.exp! * 1000),
        },
        revokeTokenReasons.USER_LOGOUT
      );
    }

    res.status(StatusCodes.NO_CONTENT).end();
  };

  private requestOTP: RequestHandler<unknown, unknown, RequestOTPBody> = async (
    req,
    res
  ) => {
    const { email } = req.body;
    await this.service.requestOTP(email);
    res.status(StatusCodes.OK).json({ message: "OTP sent" });
  };

  private verifyOTP: RequestHandler<unknown, unknown, VerifyOTPBody> = async (
    req,
    res
  ) => {
    const { email, otp } = req.body;

    await this.service.verifyOTP(email, otp);

    const user = await this.service.findUserByEmail(email, {
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedError("No user found with this email");
    }

    const accessToken = await generateJWT(
      user.id,
      process.env.JWT_ACCESS_EXPIRATION
    );

    setCookie(res, accessToken, "access_token");

    res.status(StatusCodes.OK).json({ message: "OTP verified" });
  };

  private requestMagicLink: RequestHandler<
    unknown,
    unknown,
    RequestMagicLinkBody
  > = async (req, res) => {
    const { email } = req.body;

    await this.service.requestMagicLink(email);

    res.status(StatusCodes.OK).json({ message: "Magic link sent" });
  };

  private verifyMagicLink: RequestHandler<
    unknown,
    unknown,
    VerifyMagicLinkBody,
    VerifyMagicLinkQuery
  > = async (req, res) => {
    const { email } = req.body;
    const { token } = req.query;

    await this.service.verifyMagicLink(email, token);

    const user = await this.service.findUserByEmail(email, {
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedError("No user found with this email");
    }

    const accessToken = await generateJWT(
      user.id,
      process.env.JWT_ACCESS_EXPIRATION
    );

    const refreshToken = await generateJWT(
      user.id,
      process.env.JWT_REFRESH_EXPIRATION
    );

    setCookie(res, accessToken, "access_token");
    setCookie(res, refreshToken, "refresh_token");

    res.status(StatusCodes.OK).json({ message: "Magic link verified" });
  };

  private requestEmailVerification: RequestHandler<
    unknown,
    unknown,
    RequestEmailVerificationBody
  > = async (req, res) => {
    const { email } = req.body;

    const token = await this.service.requestEmailVerification(email);

    res
      .status(StatusCodes.OK)
      .json({ message: "Email verification sent", token });
  };

  private verifyEmailVerification: RequestHandler<
    unknown,
    unknown,
    VerifyEmailVerificationBody,
    VerifyEmailVerificationQuery
  > = async (req, res) => {
    const { email } = req.body;
    const { token } = req.query;

    await this.service.verifyEmailVerification(email, token);

    res
      .status(StatusCodes.OK)
      .json({ message: "Email verification successful" });
  };

  private forgetPassword: RequestHandler<unknown, unknown, ForgetPasswordBody> =
    async (req, res) => {
      const { email } = req.body;

      await this.service.forgetPassword(email);

      res.status(StatusCodes.OK).json({ message: "Password reset link sent" });
    };

  private resetPassword: RequestHandler<
    unknown,
    unknown,
    ResetPasswordBody,
    ResetPasswordQuery
  > = async (req, res) => {
    const { email, newPassword } = req.body;
    const { token } = req.query;

    await this.service.resetPassword(email, token, newPassword);

    res.status(StatusCodes.OK).json({ message: "Password reset successful" });
  };

  private updatePassword: RequestHandler<unknown, unknown, UpdatePasswordBody> =
    async (req, res) => {
      const { currentPassword, newPassword } = req.body;

      const userId = req.currUser?.id!;

      await this.service.updatePassword(userId, currentPassword, newPassword);

      const refreshToken = req.signedCookies.refresh_token;

      const payload = await verifyJWT(refreshToken);

      if (payload) {
        await this.service.revokeToken(
          {
            jti: payload.jti!,
            token: refreshToken,
            expiresAt: new Date(payload.exp! * 1000),
          },
          revokeTokenReasons.PASSWORD_CHANGE
        );
      }

      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      res.status(StatusCodes.NO_CONTENT).end();
    };

  private refresh: RequestHandler = async (req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const refreshToken = req.signedCookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    const payload = await verifyJWT(refreshToken);

    if (!payload) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const isRevoked = await this.service.isTokenRevoked(
      payload.jti!,
      refreshToken
    );

    if (isRevoked) {
      throw new UnauthorizedError("Refresh token has been revoked");
    }

    await this.service.revokeToken(
      {
        jti: payload.jti!,
        token: refreshToken,
        expiresAt: new Date(payload.exp! * 1000),
      },
      revokeTokenReasons.REFRESH_TOKEN_ROTATION
    );

    const user = await this.service.findUserById(payload.sub!, {
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const accessToken = await generateJWT(
      user.id,
      process.env.JWT_ACCESS_EXPIRATION
    );

    setCookie(res, accessToken, "access_token");

    const newRefreshToken = await generateJWT(
      user.id,
      process.env.JWT_REFRESH_EXPIRATION
    );

    setCookie(res, newRefreshToken, "refresh_token");

    res.status(StatusCodes.NO_CONTENT).end();
  };
}
