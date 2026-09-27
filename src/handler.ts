import { render } from "@react-email/render";
import { sendEmail } from "./mailer.js";
import { TestNotification } from "./emails/test-notification.js";
import { CompetitionMemberAdded } from "./emails/competition-member-added.js";
import { CompetitionPropAdded } from "./emails/competition-prop-added.js";
import { ManualMessage } from "./emails/manual-message.js";
import type { BaseEvent, NotifyTarget } from "./types.js";
import type { EmailFromResolver } from "./email-from.js";

type TemplateRenderer = (
  event: BaseEvent,
  target: NotifyTarget,
) => { subject: string; html: Promise<string> };

/** The reader's name, or a greeting that works without one. */
function nameOf(target: NotifyTarget): string {
  return target.name ?? "there";
}

/**
 * What tells a mail client it may show its own unsubscribe button.
 *
 * Both headers or neither: RFC 8058 needs the POST url and the fixed body, and
 * Gmail shows nothing without the pair. Absent for mail with no link, which is
 * mail that cannot be turned off.
 */
function unsubscribeHeaders(
  target: NotifyTarget,
): Record<string, string> | undefined {
  if (!target.unsubscribe_post_url) return undefined;
  return {
    "List-Unsubscribe": `<${target.unsubscribe_post_url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

const templates: Record<string, TemplateRenderer> = {
  "test.notification": (event, target) => ({
    subject: "Test Notification",
    html: render(
      TestNotification({
        recipientName: nameOf(target),
        message: (event.data.message as string) ?? "",
      }),
    ),
  }),
  // Written by an admin on the Users page, so subject and body are both
  // theirs. haruspex rejects an empty subject or body before publishing; the
  // fallbacks here only keep a malformed event from sending a blank-subject
  // email.
  "admin.manual_email": (event, target) => ({
    subject:
      (event.data.subject as string)?.trim() || "A message from Haruspex",
    html: render(
      ManualMessage({
        recipientName: nameOf(target),
        body: (event.data.body as string) ?? "",
      }),
    ),
  }),
  "competition.member_added": (event, target) => ({
    subject: `You've been added to ${(event.data.competition_name as string) ?? "a competition"}`,
    html: render(
      CompetitionMemberAdded({
        recipientName: nameOf(target),
        competitionName:
          (event.data.competition_name as string) ?? "a competition",
        actionUrl: event.notify_link,
        manageUrl: event.manage_link,
        unsubscribeUrl: target.unsubscribe_url,
      }),
    ),
  }),
  // haruspex publishes one of these per recipient, so a failed send here
  // retries only its own reader.
  "competition.prop_added": (event, target) => {
    const competitionName =
      (event.data.competition_name as string) ?? "your competition";
    return {
      subject: `New prop in ${competitionName}`,
      html: render(
        CompetitionPropAdded({
          recipientName: nameOf(target),
          competitionName,
          propText: (event.data.prop_text as string) ?? "",
          forecastsDueDate: (event.data.forecasts_due_date as string) ?? null,
          actionUrl: event.notify_link,
          manageUrl: event.manage_link,
          unsubscribeUrl: target.unsubscribe_url,
        }),
      ),
    };
  },
};

export async function handleEvent(
  event: BaseEvent,
  resolveFrom: EmailFromResolver,
): Promise<void> {
  const renderer = templates[event.event_type];
  if (!renderer) {
    console.warn(
      `Unknown event type: ${event.event_type}, acking to avoid retry`,
    );
    return;
  }

  if (!event.notify?.length) {
    console.warn(`Event ${event.event_type} has no notify targets, skipping`);
    return;
  }

  const emailFrom = resolveFrom(event.source);

  // Logged on both sides of the send: the first line gives a failure the
  // recipient it died on, the second carries the Resend id, which is the only
  // way to find the message in Resend afterwards.
  const trace = event.correlation_id
    ? ` correlation_id=${event.correlation_id}`
    : "";

  for (const target of event.notify) {
    const { subject, html: htmlPromise } = renderer(event, target);
    const html = await htmlPromise;
    console.log(
      `Sending "${subject}" to ${target.email} for event ${event.event_type}${trace}`,
    );
    const resendId = await sendEmail(
      emailFrom,
      target.email,
      subject,
      html,
      unsubscribeHeaders(target),
    );
    console.log(
      `Sent to ${target.email} resend_id=${resendId ?? "none"}${trace}`,
    );
  }
}
