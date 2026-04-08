import { render } from "@react-email/render";
import { sendEmail } from "./mailer.js";
import { TestNotification } from "./emails/test-notification.js";
import { CompetitionMemberAdded } from "./emails/competition-member-added.js";
import { PropCreated } from "./emails/prop-created.js";
import type { BaseEvent } from "./types.js";

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
  "prop.created": (event, recipientName) => ({
    subject: `New prop in ${(event.data.competition_name as string) ?? "a competition"}`,
    html: render(
      PropCreated({
        recipientName,
        propText: (event.data.prop_text as string) ?? "",
        competitionName: (event.data.competition_name as string) ?? "a competition",
        actionUrl: event.notify_link,
      }),
    ),
  }),
};

export async function handleEvent(
  event: BaseEvent,
  emailFrom: string,
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

  for (const target of event.notify) {
    const { subject, html: htmlPromise } = renderer(event, target.name ?? "there");
    const html = await htmlPromise;
    console.log(
      `Sending "${subject}" to ${target.email} for event ${event.event_type}`,
    );
    await sendEmail(emailFrom, target.email, subject, html);
  }
}
