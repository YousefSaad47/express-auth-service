import { render } from "@react-email/components";

import { EmailVerificationTemplate } from "./email-verification.template";
import { MagicLinkEmailTemplate } from "./magic-link-email.template";
import { OTPEmailTemplate } from "./otp-email.template";
import { ResetPasswordEmailTemplate } from "./reset-password-email.template";
import { WelcomeEmailTemplate } from "./welcome-email.template";

const welcomeEmailTemplate = async (to: string, url: string) => {
  const html = await render(<WelcomeEmailTemplate to={to} loginUrl={url} />);

  const text = await render(<WelcomeEmailTemplate to={to} loginUrl={url} />, {
    plainText: true,
  });

  return { html, text };
};

const resetPasswordEmailTemplate = async (to: string, url: string) => {
  const html = await render(<ResetPasswordEmailTemplate to={to} url={url} />);

  const text = await render(<ResetPasswordEmailTemplate to={to} url={url} />, {
    plainText: true,
  });

  return { html, text };
};

const otpEmailTemplate = async (to: string, otp: string) => {
  const html = await render(<OTPEmailTemplate to={to} otp={otp} />);

  const text = await render(<OTPEmailTemplate to={to} otp={otp} />, {
    plainText: true,
  });

  return { html, text };
};

const magicLinkEmailTemplate = async (to: string, url: string) => {
  const html = await render(<MagicLinkEmailTemplate to={to} url={url} />);

  const text = await render(<MagicLinkEmailTemplate to={to} url={url} />, {
    plainText: true,
  });

  return { html, text };
};

const emailVerificationTemplate = async (to: string, url: string) => {
  const html = await render(<EmailVerificationTemplate to={to} url={url} />);

  const text = await render(<EmailVerificationTemplate to={to} url={url} />, {
    plainText: true,
  });

  return { html, text };
};

export const emailTemplates = {
  welcome: {
    render: welcomeEmailTemplate,
    subject: "Welcome to Our Platform!",
  },
  resetPassword: {
    render: resetPasswordEmailTemplate,
    subject: "Reset Your Password",
  },
  otp: {
    render: otpEmailTemplate,
    subject: "Your One-Time Passcode",
  },
  magicLink: {
    render: magicLinkEmailTemplate,
    subject: "Your Magic Link",
  },
  emailVerification: {
    render: emailVerificationTemplate,
    subject: "Verify Your Email Address",
  },
};

export type EmailTemplate = keyof typeof emailTemplates;
