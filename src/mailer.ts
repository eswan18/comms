import { Resend } from "resend";

let resendClient: Resend | null = null;

export function initMailer(apiKey: string): void {
  resendClient = new Resend(apiKey);
}

export async function sendEmail(
  from: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!resendClient) {
    throw new Error("Mailer not initialized. Call initMailer() first.");
  }
  const { error } = await resendClient.emails.send({ from, to, subject, html });
  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }
}
