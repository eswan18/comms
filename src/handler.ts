import { render } from "@react-email/render";
import { sendEmail } from "./mailer.js";
import { TestNotification } from "./emails/test-notification.js";
import { CompetitionMemberAdded } from "./emails/competition-member-added.js";
import type { BaseEvent } from "./types.js";

type TemplateRenderer = (event: BaseEvent) => { subject: string; html: Promise<string> };

const templates: Record<string, TemplateRenderer> = {
  "test.notification": (event) => ({
    subject: "Test Notification",
    html: render(
      TestNotification({
        recipientName: event.notify?.[0]?.name ?? "there",
        message: (event.data.message as string) ?? "",
      }),
    ),
  }),
  "competition.member_added": (event) => ({
    subject: `You've been added to ${(event.data.competition_name as string) ?? "a competition"}`,
    html: render(
      CompetitionMemberAdded({
        recipientName: event.notify?.[0]?.name ?? "there",
        competitionName: (event.data.competition_name as string) ?? "a competition",
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

  const { subject, html: htmlPromise } = renderer(event);
  const html = await htmlPromise;

  if (!event.notify?.length) {
    console.warn(`Event ${event.event_type} has no notify targets, skipping`);
    return;
  }

  for (const target of event.notify) {
    console.log(
      `Sending "${subject}" to ${target.email} for event ${event.event_type}`,
    );
    await sendEmail(emailFrom, target.email, subject, html);
  }
}
