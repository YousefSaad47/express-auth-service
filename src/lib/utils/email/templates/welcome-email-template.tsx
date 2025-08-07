import { CSSProperties } from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button,
} from "@react-email/components";

interface WelcomeEmailProps {
  to: string;
  loginUrl: string;
}

export const WelcomeEmailTemplate = ({ to, loginUrl }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Our Platform, {to}!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.logo}>🚀 YourApp</Text>

          <Text style={styles.heading}>Welcome, {to}!</Text>

          <Text style={styles.content}>
            We're excited to have you on board. Your account has been created
            successfully.
          </Text>

          <Button style={styles.button} href={loginUrl}>
            Log In Now
          </Button>

          <Text style={styles.content}>
            If you have any questions, reach out to our support team anytime.
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
  button: {
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "6px",
    textDecoration: "none",
    display: "inline-block",
    marginTop: "24px",
    fontWeight: "bold",
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
