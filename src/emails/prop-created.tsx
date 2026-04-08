import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout.js";

interface PropCreatedProps {
  recipientName: string;
  propText: string;
  competitionName: string;
  actionUrl?: string;
}

export function PropCreated({
  recipientName,
  propText,
  competitionName,
  actionUrl,
}: PropCreatedProps) {
  return (
    <BaseLayout actionUrl={actionUrl} actionLabel="View Competition">
      <Heading as="h2" style={heading}>
        New prop added
      </Heading>
      <Text style={text}>Hi {recipientName},</Text>
      <Text style={text}>
        A new prop has been added to <strong>{competitionName}</strong>:
      </Text>
      <Text style={propBlock}>{propText}</Text>
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

const propBlock = {
  fontSize: "16px",
  lineHeight: "26px",
  backgroundColor: "#f6f9fc",
  padding: "12px 16px",
  borderRadius: "5px",
  borderLeft: "4px solid #1a1a1a",
  fontStyle: "italic" as const,
};
