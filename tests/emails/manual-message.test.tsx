import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { ManualMessage } from "../../src/emails/manual-message.js";

describe("ManualMessage template", () => {
  it("renders the recipient name and body", async () => {
    const html = await render(
      ManualMessage({
        recipientName: "Ethan",
        body: "Your account has been upgraded.",
      }),
    );

    expect(html).toContain("Ethan");
    expect(html).toContain("Your account has been upgraded.");
  });

  it("preserves line breaks rather than collapsing the body into one run", async () => {
    const html = await render(
      ManualMessage({
        recipientName: "Ethan",
        body: "First line.\n\nSecond paragraph.",
      }),
    );

    // pre-wrap is what keeps the author's paragraph breaks visible; without it
    // an admin's carefully formatted note arrives as a single blob.
    expect(html).toMatch(/pre-wrap/);
    expect(html).toContain("Second paragraph.");
  });

  it("escapes HTML in the body so an admin cannot inject markup", async () => {
    const html = await render(
      ManualMessage({
        recipientName: "Ethan",
        body: '<script>alert("x")</script>',
      }),
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
