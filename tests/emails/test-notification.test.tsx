import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { TestNotification } from "../../src/emails/test-notification.js";

describe("TestNotification template", () => {
  it("renders with recipient name and message", async () => {
    const html = await render(
      TestNotification({ recipientName: "Ethan", message: "Hello from comms" }),
    );

    expect(html).toContain("Ethan");
    expect(html).toContain("Hello from comms");
    expect(html).toContain("Test Notification");
  });

  it("renders default message when message is empty", async () => {
    const html = await render(
      TestNotification({ recipientName: "Ethan", message: "" }),
    );

    expect(html).toContain("This is a test notification");
  });
});
