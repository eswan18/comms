import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout.js";

interface TestNotificationProps {
  recipientName: string;
  message: string;
}

export function TestNotification({
  recipientName,
  message,
}: TestNotificationProps) {
  return (
    <BaseLayout>
      <Heading as="h2" style={heading}>
        Test Notification
      </Heading>
      <Text style={text}>Hi {recipientName},</Text>
      <Text style={text}>{message || "This is a test notification from the comms service."}</Text>
    </BaseLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  marginBottom: "16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
};
