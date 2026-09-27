import * as React from "react";
import { BaseLayout, SheetHeading, SheetText } from "./base-layout.js";

interface CompetitionMemberAddedProps {
  recipientName: string;
  competitionName: string;
  actionUrl?: string;
  /** Where the reader turns this mail off; see BaseLayout. */
  manageUrl?: string;
  /** This reader's own unsubscribe link, the asking one; see BaseLayout. */
  unsubscribeUrl?: string;
}

export function CompetitionMemberAdded({
  recipientName,
  competitionName,
  actionUrl,
  manageUrl,
  unsubscribeUrl,
}: CompetitionMemberAddedProps) {
  return (
    <BaseLayout
      actionUrl={actionUrl}
      actionLabel="View competition"
      manageUrl={manageUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <SheetHeading>You&rsquo;ve been added to a competition</SheetHeading>
      <SheetText>Hi {recipientName},</SheetText>
      <SheetText>
        You&rsquo;ve been added to <strong>{competitionName}</strong> on
        Haruspex. Sign in to start making predictions.
      </SheetText>
    </BaseLayout>
  );
}
