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

  it("passes custom headers through, which is how one-click unsubscribe works", async () => {
    send.mockResolvedValue({ data: { id: "re_abc123" }, error: null });

    await sendEmail("from@x.com", "to@x.com", "Subject", "<p>hi</p>", {
      "List-Unsubscribe": "<https://haruspex.fyi/api/unsubscribe?t=tok>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          "List-Unsubscribe": "<https://haruspex.fyi/api/unsubscribe?t=tok>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    );
  });

  it("sends no headers key at all when there are none", async () => {
    send.mockResolvedValue({ data: { id: "re_abc123" }, error: null });

    await sendEmail("from@x.com", "to@x.com", "Subject", "<p>hi</p>");

    expect(send.mock.calls[0]![0]).not.toHaveProperty("headers");
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
