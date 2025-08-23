import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { CSSProperties } from "react";

interface OtpEmailProps {
  to: string;
  otp: string;
}

export const OTPEmailTemplate = ({ to, otp }: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your OTP code is {otp}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.logo}>🔐 YourApp</Text>
          <Text style={styles.heading}>Your One-Time Passcode</Text>
          <Text style={styles.content}>Hi {to}, your OTP code is:</Text>
          <Text style={styles.otp}>{otp}</Text>
          <Text style={styles.content}>
            This code will expire in 1 minute. If you didn’t request this,
            please ignore the email.
          </Text>
          <Text style={styles.signature}>– The YourApp Team</Text>
          <Text style={styles.footer}>
            © {new Date().getFullYear()} YourApp, Inc. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: "#f9f9f9",
    fontFamily: "'Segoe UI', sans-serif",
    fontSize: "16px",
    color: "#1a1a1a",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000000",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#000000",
    marginTop: "20px",
  },
  content: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginTop: "12px",
    color: "#333333",
  },
  otp: {
    fontSize: "28px",
    fontWeight: "bold",
    letterSpacing: "4px",
    marginTop: "20px",
    marginBottom: "20px",
    textAlign: "center",
    color: "#000000",
  },
  signature: {
    fontSize: "14px",
    color: "#555555",
    marginTop: "24px",
  },
  footer: {
    fontSize: "12px",
    color: "#888888",
    marginTop: "24px",
    textAlign: "center",
  },
};
