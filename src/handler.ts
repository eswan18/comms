import { render } from "@react-email/render";
import { sendEmail } from "./mailer.js";
import { TestNotification } from "./emails/test-notification.js";
import type { BaseEvent } from "./types.js";

type TemplateRenderer = (event: BaseEvent) => { subject: string; html: Promise<string> };

const templates: Record<string, TemplateRenderer> = {
  "test.notification": (event) => ({
    subject: "Test Notification",
    html: render(
      TestNotification({
        recipientName: event.recipients[0]?.name ?? "there",
        message: (event.data.message as string) ?? "",
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

  for (const recipient of event.recipients) {
    console.log(
      `Sending "${subject}" to ${recipient.email} for event ${event.event_type}`,
    );
    await sendEmail(emailFrom, recipient.email, subject, html);
  }
}
