import { Resend } from "resend";

let resendClient: Resend | null = null;

export function initMailer(apiKey: string): void {
  resendClient = new Resend(apiKey);
}

/**
 * Sends one email and returns Resend's id for it.
 *
 * The id is the only handle that ties a line in our logs to a message in
 * Resend's dashboard, so it is returned rather than dropped. Resend can
 * report success without a body in principle, hence the null.
 */
export async function sendEmail(
  from: string,
  to: string,
  subject: string,
  html: string,
): Promise<string | null> {
  if (!resendClient) {
    throw new Error("Mailer not initialized. Call initMailer() first.");
  }
  const { data, error } = await resendClient.emails.send({
    from,
    to,
    subject,
    html,
  });
  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }
  return data?.id ?? null;
}
