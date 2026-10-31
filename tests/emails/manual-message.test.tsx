import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { ManualMessage } from "../../src/emails/manual-message.js";

describe("ManualMessage template", () => {
  it("renders the body as markdown", async () => {
    const html = await render(
      ManualMessage({ body: "Hi Alice,\n\nYour account is **upgraded**." }),
    );

    expect(html).toContain("Hi Alice,");
    expect(html).toContain("<strong>upgraded</strong>");
  });

  it("adds no greeting of its own", async () => {
    const html = await render(ManualMessage({ body: "Just the body." }));

    expect(html).not.toMatch(/\bHi\b/);
  });

  it("escapes HTML in the body so an admin cannot inject markup", async () => {
    const html = await render(
      ManualMessage({ body: '<script>alert("x")</script>' }),
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
