import { parseEmailFromOverrides } from "./email-from.js";

export interface Config {
  gcpProjectId: string;
  pubsubSubscriptions: string[];
  resendApiKey: string;
  emailFrom: string;
  emailFromOverrides: Record<string, string>;
  port: number;
  env: string;
}

export function loadConfig(): Config {
  const required = (name: string): string => {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  };

  const subscriptions = required("PUBSUB_SUBSCRIPTIONS");

  return {
    gcpProjectId: required("GCP_PROJECT_ID"),
    pubsubSubscriptions: subscriptions.split(",").map((s) => s.trim()),
    resendApiKey: required("RESEND_API_KEY"),
    emailFrom: required("EMAIL_FROM"),
    emailFromOverrides: parseEmailFromOverrides(
      process.env["EMAIL_FROM_OVERRIDES"],
    ),
    port: parseInt(process.env["PORT"] ?? "8080", 10),
    env: process.env["ENV"] ?? "development",
  };
}
