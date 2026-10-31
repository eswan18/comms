import * as React from "react";
import { BaseLayout } from "./base-layout.js";
import { MarkdownBody } from "./markdown-body.js";

interface AnnouncementProps {
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
 * The same shape as ManualMessage — the body is entirely the admin's, as
 * markdown, greeting included — plus what an optional mail carries: an
 * optional button, and the footer links that let a reader stop receiving it.
 */
export function Announcement({
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
      <MarkdownBody source={body} />
    </BaseLayout>
  );
}
