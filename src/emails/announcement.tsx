import * as React from "react";
import { BaseLayout, SheetText } from "./base-layout.js";

interface AnnouncementProps {
  recipientName: string;
  body: string;
  /** Both or neither: haruspex refuses a button with only one half. */
  actionUrl?: string;
  actionLabel?: string;
  /** Where the reader turns this mail off; see BaseLayout. */
  manageUrl?: string;
  /** This reader's own unsubscribe link, the asking one; see BaseLayout. */
  unsubscribeUrl?: string;
}

/**
 * A message an admin wrote once and sent to every active user who has not
 * turned announcements off.
 *
 * The same shape as ManualMessage — the body is entirely the admin's, with no
 * heading for the same reason — plus what an optional mail carries: an
 * optional button, and the footer links that let a reader stop receiving it.
 *
 * React escapes the body, so markup an admin types arrives as text rather
 * than as HTML.
 */
export function Announcement({
  recipientName,
  body,
  actionUrl,
  actionLabel,
  manageUrl,
  unsubscribeUrl,
}: AnnouncementProps) {
  return (
    <BaseLayout
      actionUrl={actionUrl}
      actionLabel={actionLabel}
      manageUrl={manageUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <SheetText>Hi {recipientName},</SheetText>
      <SheetText style={{ whiteSpace: "pre-wrap" }}>{body}</SheetText>
    </BaseLayout>
  );
}
