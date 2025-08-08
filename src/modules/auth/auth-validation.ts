import { faker } from "@faker-js/faker";
import { z } from "zod";

export const signUpBodySchema = z
  .object({
    name: z.preprocess(
      (val) => String(val).trim(),
      z.string().min(1, "First name is required")
    ),
    email: z.email().toLowerCase(),
    password: z.preprocess(
      (val) => String(val).trim(),
      z.string().min(8, "Password must be at least 8 characters long")
    ),
    confirmPassword: z.preprocess((val) => String(val).trim(), z.string()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .openapi("SignUpSchema", {
    default: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmPassword: faker.internet.password(),
    },
  });

export type SignUpBody = Omit<
  z.infer<typeof signUpBodySchema>,
  "confirmPassword"
>;

export const signInBodySchema = z
  .object({
    ...signUpBodySchema.shape,
    captchaToken: z.string().optional(),
  })
  .omit({
    name: true,
    confirmPassword: true,
  });

export type SignInBody = z.infer<typeof signInBodySchema>;

export const requestOTPBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi("RequestOTPBodySchema", {
    default: {
      email: faker.internet.email(),
    },
  });

export type RequestOTPBody = z.infer<typeof requestOTPBodySchema>;

export const verifyOTPBodySchema = z
  .object({
    email: z.email(),
    otp: z.string().length(6, "OTP must be 6 characters long"),
  })
  .openapi("VerifyOTPBodySchema", {
    default: {
      email: faker.internet.email(),
      otp: faker.string.numeric(6),
    },
  });

export type VerifyOTPBody = z.infer<typeof verifyOTPBodySchema>;

export const requestMagicLinkBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi("RequestMagicLinkBodySchema", {
    default: {
      email: faker.internet.email(),
    },
  });

export type RequestMagicLinkBody = z.infer<typeof requestMagicLinkBodySchema>;

export const verifyMagicLinkBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi("VerifyMagicLinkBodySchema", {
    default: {
      email: faker.internet.email(),
    },
  });

export type VerifyMagicLinkBody = z.infer<typeof verifyMagicLinkBodySchema>;

export const verifyTokenQuerySchemaBase = z.object({
  token: z.string().min(1, "Token is required"),
});

export const verifyMagicLinkQuerySchema = z
  .object({
    ...verifyTokenQuerySchemaBase.shape,
  })
  .openapi("VerifyMagicLinkQuerySchema", {
    default: {
      token: faker.string.uuid(),
    },
  });

export type VerifyMagicLinkQuery = z.infer<typeof verifyMagicLinkQuerySchema>;

export const requestEmailVerificationBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi("RequestEmailVerificationBodySchema", {
    default: {
      email: faker.internet.email(),
    },
  });

export type RequestEmailVerificationBody = z.infer<
  typeof requestEmailVerificationBodySchema
>;

export const verifyEmailVerificationBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi("VerifyEmailVerificationBodySchema", {
    default: {
      email: faker.internet.email(),
    },
  });

export type VerifyEmailVerificationBody = z.infer<
  typeof verifyEmailVerificationBodySchema
>;

export const verifyEmailVerificationQuerySchema = z
  .object({
    ...verifyTokenQuerySchemaBase.shape,
  })
  .openapi("VerifyEmailVerificationQuerySchema", {
    default: {
      token: faker.string.uuid(),
    },
  });

export type VerifyEmailVerificationQuery = z.infer<
  typeof verifyEmailVerificationQuerySchema
>;

export const updatePasswordBodySchema = z
  .object({
    currentPassword: z.preprocess(
      (val) => String(val).trim(),
      z.string().min(8, "Current password is required")
    ),
    newPassword: z.preprocess(
      (val) => String(val).trim(),
      z.string().min(8, "New password must be at least 8 characters long")
    ),
    confirmNewPassword: z.preprocess(
      (val) => String(val).trim(),
      z.string().min(8, "Confirm new password is required")
    ),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "passwords do not match",
    path: ["confirmNewPassword"],
  })
  .openapi("UpdatePasswordBodySchema", {
    default: {
      currentPassword: faker.internet.password(),
      newPassword: faker.internet.password(),
      confirmNewPassword: faker.internet.password(),
    },
  });

export type UpdatePasswordBody = z.infer<typeof updatePasswordBodySchema>;

export const forgetPasswordBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi("ForgetPasswordBodySchema", {
    default: {
      email: faker.internet.email(),
    },
  });

export type ForgetPasswordBody = z.infer<typeof forgetPasswordBodySchema>;

export const resetPasswordBodySchema = z
  .object({
    email: z.email(),
    newPassword: z.preprocess(
      (val) => String(val).trim(),
      z.string().min(8, "New password must be at least 8 characters long")
    ),
    confirmNewPassword: z.preprocess(
      (val) => String(val).trim(),
      z.string().min(8, "Confirm new password is required")
    ),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "passwords do not match",
    path: ["confirmNewPassword"],
  })
  .openapi("ResetPasswordBodySchema", {
    default: {
      email: faker.internet.email(),
      newPassword: faker.internet.password(),
    },
  });

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const resetPasswordQuerySchema = z
  .object({
    token: z.string().min(1, "Token is required"),
  })
  .openapi("ResetPasswordQuerySchema", {
    default: {
      token: faker.string.uuid(),
    },
  });

export type ResetPasswordQuery = z.infer<typeof resetPasswordQuerySchema>;

export const csrfHeaderSchema = z.object({
  "x-csrf": z.string().optional(),
});
