import { Heading, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout.js";

interface CompetitionMemberAddedProps {
  recipientName: string;
  competitionName: string;
}

export function CompetitionMemberAdded({
  recipientName,
  competitionName,
}: CompetitionMemberAddedProps) {
  return (
    <BaseLayout>
      <Heading as="h2" style={heading}>
        You've been added to a competition
      </Heading>
      <Text style={text}>Hi {recipientName},</Text>
      <Text style={text}>
        You've been added to <strong>{competitionName}</strong> on Forecasting.
        Sign in to start making predictions.
      </Text>
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
