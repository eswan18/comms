import * as React from "react";
import { BaseLayout } from "./base-layout.js";
import { MarkdownBody } from "./markdown-body.js";

interface ManualMessageProps {
  body: string;
}

/**
 * A message an admin wrote by hand, sent to one user from the Users page.
 *
 * Unlike the other templates there is no fixed copy here — the whole body is
 * the admin's, as markdown (see MarkdownBody). That includes the greeting:
 * there is no "Hi {name}," because a merged-in name reads as a form letter in
 * a message someone actually wrote. No heading either, because the subject
 * line is theirs too.
 */
export function ManualMessage({ body }: ManualMessageProps) {
  return (
    <BaseLayout>
      <MarkdownBody source={body} />
    </BaseLayout>
  );
}
