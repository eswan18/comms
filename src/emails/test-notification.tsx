import * as React from "react";
import { BaseLayout, SheetHeading, SheetText } from "./base-layout.js";

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
      <SheetHeading>Test Notification</SheetHeading>
      <SheetText>Hi {recipientName},</SheetText>
      <SheetText>
        {message || "This is a test notification from the comms service."}
      </SheetText>
    </BaseLayout>
  );
}
