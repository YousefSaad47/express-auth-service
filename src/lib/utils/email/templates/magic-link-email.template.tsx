import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { CSSProperties } from "react";

interface MagicLinkEmailProps {
  to: string;
  url: string;
}

export const MagicLinkEmailTemplate = ({ to, url }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Log in instantly, {to}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.logo}>✨ YourApp</Text>
          <Text style={styles.heading}>Your Magic Login Link</Text>
          <Text style={styles.content}>
            Hello {to}, click the button below to securely log in to your
            account.
          </Text>
          <Button style={styles.button} href={url}>
            Log In Instantly
          </Button>
          <Text style={styles.content}>
            This link will expire in 15 minutes or after it’s used once.
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
