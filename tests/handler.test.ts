import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleEvent } from "../src/handler.js";
import type { BaseEvent } from "../src/types.js";

vi.mock("../src/mailer.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
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

    await handleEvent(event, "noreply@example.com");

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

    await handleEvent(event, "noreply@example.com");

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

    await handleEvent(event, "noreply@example.com");

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

    await handleEvent(event, "noreply@example.com");

    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
