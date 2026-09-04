import { render } from "@react-email/render";
import { sendEmail } from "./mailer.js";
import { TestNotification } from "./emails/test-notification.js";
import { CompetitionMemberAdded } from "./emails/competition-member-added.js";
import { ManualMessage } from "./emails/manual-message.js";
import type { BaseEvent } from "./types.js";
import type { EmailFromResolver } from "./email-from.js";

type TemplateRenderer = (
  event: BaseEvent,
  recipientName: string,
) => { subject: string; html: Promise<string> };

const templates: Record<string, TemplateRenderer> = {
  "test.notification": (event, recipientName) => ({
    subject: "Test Notification",
    html: render(
      TestNotification({
        recipientName,
        message: (event.data.message as string) ?? "",
      }),
    ),
  }),
  // Written by an admin on the Users page, so subject and body are both
  // theirs. haruspex rejects an empty subject or body before publishing; the
  // fallbacks here only keep a malformed event from sending a blank-subject
  // email.
  "admin.manual_email": (event, recipientName) => ({
    subject: (event.data.subject as string)?.trim() || "A message from Haruspex",
    html: render(
      ManualMessage({
        recipientName,
        body: (event.data.body as string) ?? "",
      }),
    ),
  }),
  "competition.member_added": (event, recipientName) => ({
    subject: `You've been added to ${(event.data.competition_name as string) ?? "a competition"}`,
    html: render(
      CompetitionMemberAdded({
        recipientName,
        competitionName: (event.data.competition_name as string) ?? "a competition",
        actionUrl: event.notify_link,
      }),
    ),
  }),
};

export async function handleEvent(
  event: BaseEvent,
  resolveFrom: EmailFromResolver,
): Promise<void> {
  const renderer = templates[event.event_type];
  if (!renderer) {
    console.warn(`Unknown event type: ${event.event_type}, acking to avoid retry`);
    return;
  }

  if (!event.notify?.length) {
    console.warn(`Event ${event.event_type} has no notify targets, skipping`);
    return;
  }

  const emailFrom = resolveFrom(event.source);

  for (const target of event.notify) {
    const { subject, html: htmlPromise } = renderer(event, target.name ?? "there");
    const html = await htmlPromise;
    console.log(
      `Sending "${subject}" to ${target.email} for event ${event.event_type}`,
    );
    await sendEmail(emailFrom, target.email, subject, html);
  }
}
