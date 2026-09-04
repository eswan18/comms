import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleEvent } from "../src/handler.js";
import type { BaseEvent } from "../src/types.js";

vi.mock("../src/mailer.js", () => ({
  sendEmail: vi.fn().mockResolvedValue("re_default"),
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html>test</html>"),
}));

import { sendEmail } from "../src/mailer.js";

const mockSendEmail = vi.mocked(sendEmail);

describe("handleEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends email for test.notification event", async () => {
    const event: BaseEvent = {
      event_type: "test.notification",
      source: "manual",
      timestamp: "2026-02-07T10:00:00Z",
      notify: [{ email: "test@example.com", name: "Test User" }],
      data: { message: "Hello" },
    };

    await handleEvent(event, () => "noreply@example.com");

    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledWith(
      "noreply@example.com",
      "test@example.com",
      "Test Notification",
      expect.any(String),
    );
  });

  it("sends to multiple notify targets", async () => {
    const event: BaseEvent = {
      event_type: "test.notification",
      source: "manual",
      timestamp: "2026-02-07T10:00:00Z",
      notify: [
        { email: "a@example.com", name: "A" },
        { email: "b@example.com", name: "B" },
      ],
      data: { message: "Hello" },
    };

    await handleEvent(event, () => "noreply@example.com");

    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(mockSendEmail).toHaveBeenCalledWith(
      "noreply@example.com",
      "a@example.com",
      "Test Notification",
      expect.any(String),
    );
    expect(mockSendEmail).toHaveBeenCalledWith(
      "noreply@example.com",
      "b@example.com",
      "Test Notification",
      expect.any(String),
    );
  });

  it("sends email for competition.member_added event", async () => {
    const event: BaseEvent = {
      event_type: "competition.member_added",
      source: "forecasting",
      timestamp: "2026-04-07T10:00:00Z",
      notify: [{ email: "newmember@example.com", name: "Jane" }],
      data: { competition_name: "Q2 Predictions", competition_id: 42 },
    };

    await handleEvent(event, () => "noreply@example.com");

    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledWith(
      "noreply@example.com",
      "newmember@example.com",
      "You've been added to Q2 Predictions",
      expect.any(String),
    );
  });

  it("skips unknown event types without error", async () => {
    const event: BaseEvent = {
      event_type: "unknown.event",
      source: "manual",
      timestamp: "2026-02-07T10:00:00Z",
      notify: [{ email: "test@example.com", name: "Test" }],
      data: {},
    };

    await handleEvent(event, () => "noreply@example.com");

    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("selects the From address from the event source", async () => {
    const resolveFrom = (source: string) =>
      source === "forecasting"
        ? "Haruspex <noreply@mail.haruspex.fyi>"
        : "noreply@mail.identity.ethanswan.com";

    const event: BaseEvent = {
      event_type: "competition.member_added",
      source: "forecasting",
      timestamp: "2026-02-07T10:00:00Z",
      notify: [{ email: "alice@example.com", name: "Alice" }],
      data: { competition_name: "Q2 Predictions" },
    };

    await handleEvent(event, resolveFrom);

    expect(mockSendEmail).toHaveBeenCalledWith(
      "Haruspex <noreply@mail.haruspex.fyi>",
      "alice@example.com",
      expect.any(String),
      expect.any(String),
    );
  });

  it("falls back to the default From for a source with no override", async () => {
    const resolveFrom = (source: string) =>
      source === "forecasting"
        ? "Haruspex <noreply@mail.haruspex.fyi>"
        : "noreply@mail.identity.ethanswan.com";

    const event: BaseEvent = {
      event_type: "test.notification",
      source: "identity",
      timestamp: "2026-02-07T10:00:00Z",
      notify: [{ email: "alice@example.com", name: "Alice" }],
      data: { message: "Hello" },
    };

    await handleEvent(event, resolveFrom);

    expect(mockSendEmail).toHaveBeenCalledWith(
      "noreply@mail.identity.ethanswan.com",
      "alice@example.com",
      expect.any(String),
      expect.any(String),
    );
  });

  it("uses the admin's own subject and body for admin.manual_email", async () => {
    const event: BaseEvent = {
      event_type: "admin.manual_email",
      source: "forecasting",
      timestamp: "2026-09-04T10:00:00Z",
      notify: [{ email: "alice@example.com", name: "Alice" }],
      data: { subject: "About your account", body: "Please get in touch." },
    };

    await handleEvent(event, () => "noreply@example.com");

    expect(mockSendEmail).toHaveBeenCalledOnce();
    const [, to, subject, html] = mockSendEmail.mock.calls[0]!;
    expect(to).toBe("alice@example.com");
    expect(subject).toBe("About your account");
    expect(html).toEqual(expect.any(String));
  });

  it("falls back to a real subject if a malformed event has none", async () => {
    const event: BaseEvent = {
      event_type: "admin.manual_email",
      source: "forecasting",
      timestamp: "2026-09-04T10:00:00Z",
      notify: [{ email: "alice@example.com", name: "Alice" }],
      data: { subject: "   ", body: "Body still present." },
    };

    await handleEvent(event, () => "noreply@example.com");

    expect(mockSendEmail.mock.calls[0]![2]).toBe("A message from Haruspex");
  });

  it("logs the Resend id, so a send can be found in Resend afterwards", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    mockSendEmail.mockResolvedValue("re_xyz789");

    const event: BaseEvent = {
      event_type: "test.notification",
      source: "manual",
      timestamp: "2026-09-04T10:00:00Z",
      notify: [{ email: "a@example.com", name: "A" }],
      data: { message: "Hello" },
    };

    await handleEvent(event, () => "noreply@example.com");

    const lines = log.mock.calls.map((c) => String(c[0]));
    expect(lines.some((l) => l.includes("resend_id=re_xyz789"))).toBe(true);
    log.mockRestore();
  });

  it("carries the publisher's correlation id into both log lines", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    mockSendEmail.mockResolvedValue("re_1");

    const event: BaseEvent = {
      event_type: "test.notification",
      source: "forecasting",
      timestamp: "2026-09-04T10:00:00Z",
      correlation_id: "c-123",
      notify: [{ email: "a@example.com", name: "A" }],
      data: { message: "Hello" },
    };

    await handleEvent(event, () => "noreply@example.com");

    const traced = log.mock.calls
      .map((c) => String(c[0]))
      .filter((l) => l.includes("correlation_id=c-123"));
    expect(traced).toHaveLength(2);
    log.mockRestore();
  });

  it("omits the correlation field entirely when the publisher sent none", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    mockSendEmail.mockResolvedValue("re_1");

    const event: BaseEvent = {
      event_type: "test.notification",
      source: "manual",
      timestamp: "2026-09-04T10:00:00Z",
      notify: [{ email: "a@example.com", name: "A" }],
      data: { message: "Hello" },
    };

    await handleEvent(event, () => "noreply@example.com");

    const lines = log.mock.calls.map((c) => String(c[0]));
    expect(lines.some((l) => l.includes("correlation_id"))).toBe(false);
    log.mockRestore();
  });
});
