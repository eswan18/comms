import * as React from "react";
import { BaseLayout, SheetHeading, SheetText } from "./base-layout.js";

interface CompetitionMemberAddedProps {
  recipientName: string;
  competitionName: string;
  actionUrl?: string;
}

export function CompetitionMemberAdded({
  recipientName,
  competitionName,
  actionUrl,
}: CompetitionMemberAddedProps) {
  return (
    <BaseLayout actionUrl={actionUrl} actionLabel="View competition">
      <SheetHeading>You&rsquo;ve been added to a competition</SheetHeading>
      <SheetText>Hi {recipientName},</SheetText>
      <SheetText>
        You&rsquo;ve been added to <strong>{competitionName}</strong> on
        Haruspex. Sign in to start making predictions.
      </SheetText>
    </BaseLayout>
  );
}
