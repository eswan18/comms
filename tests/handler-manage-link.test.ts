import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleEvent } from "../src/handler.js";
import type { BaseEvent } from "../src/types.js";

vi.mock("../src/mailer.js", () => ({
  sendEmail: vi.fn().mockResolvedValue("re_default"),
}));

import { sendEmail } from "../src/mailer.js";

const mockSendEmail = vi.mocked(sendEmail);

/**
 * The manage link end to end, with the real renderer.
 *
 * handler.test.ts mocks `@react-email/render`, which is right for what it
 * checks and useless here: the only proof that the link survives the handler
 * is the HTML that actually goes to Resend.
 */
describe("the manage link reaches the sent mail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const event = (over: Partial<BaseEvent> = {}): BaseEvent => ({
    event_type: "competition.prop_added",
    source: "haruspex",
    timestamp: "2026-09-18T10:00:00Z",
    notify: [{ email: "member@example.com", name: "Jane" }],
    notify_link: "https://haruspex.fyi/competitions/3/props/42",
    manage_link: "https://haruspex.fyi/account",
    data: {
      competition_name: "Office Pool",
      prop_text: "It snows on the first of December.",
      forecasts_due_date: "2026-11-30T17:00:00.000Z",
    },
    ...over,
  });

  it("prints it on a new-prop email", async () => {
    await handleEvent(event(), () => "noreply@example.com");

    const html = mockSendEmail.mock.calls[0]![3];
    expect(html).toContain('href="https://haruspex.fyi/account"');
    expect(html).toContain("Manage notifications");
  });

  it("prints it on an added-to-a-competition email", async () => {
    await handleEvent(
      event({
        event_type: "competition.member_added",
        data: { competition_name: "Office Pool", competition_id: 3 },
      }),
      () => "noreply@example.com",
    );

    const html = mockSendEmail.mock.calls[0]![3];
    expect(html).toContain('href="https://haruspex.fyi/account"');
  });

  it("prints nothing when the publisher sends no link", async () => {
    await handleEvent(
      event({ manage_link: undefined }),
      () => "noreply@example.com",
    );

    expect(mockSendEmail.mock.calls[0]![3]).not.toContain(
      "Manage notifications",
    );
  });

  it("prints nothing on mail that cannot be turned off", async () => {
    // An admin's own message: haruspex sends no manage_link for it, and even
    // if one arrived the template has no place to print it.
    await handleEvent(
      event({
        event_type: "admin.manual_email",
        data: { subject: "About your account", body: "Please read." },
      }),
      () => "noreply@example.com",
    );

    expect(mockSendEmail.mock.calls[0]![3]).not.toContain(
      "Manage notifications",
    );
  });
});
