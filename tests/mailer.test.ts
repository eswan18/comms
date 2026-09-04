import { describe, it, expect, vi, beforeEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { initMailer, sendEmail } from "../src/mailer.js";

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMailer("re_test_key");
  });

  it("returns Resend's message id rather than discarding it", async () => {
    send.mockResolvedValue({ data: { id: "re_abc123" }, error: null });

    const id = await sendEmail("from@x.com", "to@x.com", "Subject", "<p>hi</p>");

    expect(id).toBe("re_abc123");
    expect(send).toHaveBeenCalledWith({
      from: "from@x.com",
      to: "to@x.com",
      subject: "Subject",
      html: "<p>hi</p>",
    });
  });

  it("returns null when Resend reports success without a body", async () => {
    send.mockResolvedValue({ data: null, error: null });

    await expect(
      sendEmail("from@x.com", "to@x.com", "Subject", "<p>hi</p>"),
    ).resolves.toBeNull();
  });

  it("throws on a Resend error so the message is nacked rather than lost", async () => {
    send.mockResolvedValue({ data: null, error: { message: "rate limited" } });

    await expect(
      sendEmail("from@x.com", "to@x.com", "Subject", "<p>hi</p>"),
    ).rejects.toThrow(/rate limited/);
  });
});
