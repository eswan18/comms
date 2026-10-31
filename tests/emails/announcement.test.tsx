import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { Announcement } from "../../src/emails/announcement.js";

describe("Announcement template", () => {
  it("renders the body as markdown, with no greeting of its own", async () => {
    const html = await render(
      Announcement({
        body: "Hello fellow forecasters,\n\n## New Site Name\n\nIt's **Haruspex** now.",
      }),
    );

    expect(html).toContain("Hello fellow forecasters,");
    expect(html).toMatch(/<h2[^>]*>New Site Name<\/h2>/);
    expect(html).toContain("<strong>Haruspex</strong>");
    expect(html).not.toMatch(/\bHi\b/);
  });

  it("prints the button when given one", async () => {
    const html = await render(
      Announcement({
        body: "Body.",
        actionUrl: "https://haruspex.fyi/props/suggest",
        actionLabel: "Suggest a prop",
      }),
    );

    expect(html).toContain('href="https://haruspex.fyi/props/suggest"');
    expect(html).toContain("Suggest a prop");
  });

  it("prints no button when given none", async () => {
    const html = await render(Announcement({ body: "Body." }));

    expect(html).not.toContain('class="hx-action"');
  });

  it("prints the unsubscribe and manage links", async () => {
    const html = await render(
      Announcement({
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
      Announcement({ body: '<script>alert("x")</script>' }),
    );

    expect(html).not.toContain("<script>");
  });
});
