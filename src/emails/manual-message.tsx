import * as React from "react";
import { BaseLayout, SheetText } from "./base-layout.js";

interface ManualMessageProps {
  recipientName: string;
  body: string;
}

/**
 * A message an admin wrote by hand, sent to one user from the Users page.
 *
 * Unlike the other templates there is no fixed copy here — the whole body is
 * the admin's. It carries no heading, because the subject line is theirs too
 * and repeating it inside the message reads like a form letter.
 *
 * React escapes the body, so markup an admin types arrives as text rather
 * than as HTML.
 */
export function ManualMessage({ recipientName, body }: ManualMessageProps) {
  return (
    <BaseLayout>
      <SheetText>Hi {recipientName},</SheetText>
      {/* pre-wrap rather than paragraph-splitting: it keeps blank lines and
          single breaks exactly as they were typed, with no parsing to get
          wrong. */}
      <SheetText style={{ whiteSpace: "pre-wrap" }}>{body}</SheetText>
    </BaseLayout>
  );
}
