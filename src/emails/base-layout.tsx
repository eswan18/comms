import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  children: React.ReactNode;
  actionUrl?: string;
  actionLabel?: string;
}

export function BaseLayout({ children, actionUrl, actionLabel }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          {children}
          {actionUrl && (
            <Link href={actionUrl} style={actionButton}>
              {actionLabel ?? "View"}
            </Link>
          )}
          <Hr style={hr} />
          <Text style={footer}>Sent by Ethan's Services</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 48px",
  marginBottom: "64px",
  borderRadius: "5px",
};

const actionButton = {
  display: "inline-block" as const,
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "5px",
  textDecoration: "none" as const,
  fontSize: "14px",
  fontWeight: "bold" as const,
  marginTop: "16px",
  marginBottom: "8px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
