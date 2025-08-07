import { CSSProperties } from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Link,
} from "@react-email/components";

interface EmailVerificationProps {
  to: string;
  url: string;
}

export const EmailVerificationTemplate = ({
  to,
  url,
}: EmailVerificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.logo}>🔐 YourApp</Text>
          <Text style={styles.heading}>Verify Your Email Address</Text>
          <Text style={styles.content}>
            Hi {to}, please click the link below to verify your email:
          </Text>
          <Link href={url} style={styles.link}>
            Verify Email
          </Link>
          <Text style={styles.content}>
            This link will expire in 1 minute. If you didn’t request this, you
            can safely ignore this email.
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
  link: {
    display: "inline-block",
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    borderRadius: "6px",
    marginTop: "20px",
    marginBottom: "20px",
    textAlign: "center",
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
