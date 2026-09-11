import * as React from "react";
import { BaseLayout, SheetHeading, SheetText } from "./base-layout.js";

interface CompetitionPropAddedProps {
  recipientName: string;
  competitionName: string;
  propText: string;
  /** ISO timestamp, or null when the prop has no forecast deadline. */
  forecastsDueDate: string | null;
  actionUrl?: string;
}

/**
 * Stated in UTC, and labelled as such. An email cannot know the reader's
 * timezone the way the app's browser detection does, and haruspex's new-prop
 * form takes deadlines in UTC, so this is the time the author actually chose.
 */
function formatDeadline(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  return `${formatted} UTC`;
}

/**
 * A prop was added to a competition the reader belongs to.
 *
 * Sent only for competitions that schedule by prop, where each prop opens on
 * its own and so its arrival is news. The claim is haruspex markdown, shown
 * here as plain text: React escapes it, and a stray asterisk reads better
 * than a half-supported renderer.
 */
export function CompetitionPropAdded({
  recipientName,
  competitionName,
  propText,
  forecastsDueDate,
  actionUrl,
}: CompetitionPropAddedProps) {
  const deadline = formatDeadline(forecastsDueDate);
  return (
    <BaseLayout actionUrl={actionUrl} actionLabel="Make your forecast">
      <SheetHeading>A new prop in {competitionName}</SheetHeading>
      <SheetText>Hi {recipientName},</SheetText>
      <SheetText>
        A new prop has been added to <strong>{competitionName}</strong> on
        Haruspex:
      </SheetText>
      <SheetText style={{ fontWeight: 700, whiteSpace: "pre-wrap" }}>
        {propText}
      </SheetText>
      {deadline && <SheetText>Forecasts close {deadline}.</SheetText>}
    </BaseLayout>
  );
}
