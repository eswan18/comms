import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { Announcement } from "../../src/emails/announcement.js";

describe("Announcement template", () => {
  it("renders the recipient name and body, keeping line breaks", async () => {
    const html = await render(
      Announcement({
        recipientName: "Ethan",
        body: "Next season is coming.\n\nSend us your ideas.",
      }),
    );

    expect(html).toContain("Ethan");
    expect(html).toContain("Send us your ideas.");
    expect(html).toMatch(/pre-wrap/);
  });

  it("prints the button when given one", async () => {
    const html = await render(
      Announcement({
        recipientName: "Ethan",
        body: "Body.",
        actionUrl: "https://haruspex.fyi/props/suggest",
        actionLabel: "Suggest a prop",
      }),
    );

    expect(html).toContain('href="https://haruspex.fyi/props/suggest"');
    expect(html).toContain("Suggest a prop");
  });

  it("prints no button when given none", async () => {
    const html = await render(
      Announcement({ recipientName: "Ethan", body: "Body." }),
    );

    expect(html).not.toContain('class="hx-action"');
  });

  it("prints the unsubscribe and manage links", async () => {
    const html = await render(
      Announcement({
        recipientName: "Ethan",
        body: "Body.",
        manageUrl: "https://haruspex.fyi/account",
        unsubscribeUrl: "https://haruspex.fyi/unsubscribe?token=abc",
      }),
    );

    expect(html).toContain("Manage notifications");
    expect(html).toContain("Unsubscribe");
  });

  it("escapes HTML in the body so an admin cannot inject markup", async () => {
    const html = await render(
      Announcement({
        recipientName: "Ethan",
        body: '<script>alert("x")</script>',
      }),
    );

    expect(html).not.toContain("<script>");
  });
});
