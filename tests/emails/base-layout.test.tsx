import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { CompetitionMemberAdded } from "../../src/emails/competition-member-added.js";
import { riso, SHEET_WIDTH, SITE_URL } from "../../src/emails/theme.js";

const html = () =>
  render(
    CompetitionMemberAdded({
      recipientName: "Ethan",
      competitionName: "Q4 Predictions",
      actionUrl: "https://haruspex.fyi/competitions/3",
    }),
  );

describe("the riso sheet", () => {
  it("declares the light edition inline, so a client that strips <style> still gets a whole design", async () => {
    const out = await html();
    expect(out).toContain(riso.light.paper);
    expect(out).toContain(riso.light.ink);
  });

  it("carries the dark edition as a media query, which is the only way to beat an inline style", async () => {
    const out = await html();
    // Inline styles win over stylesheet rules, so the dark values have to
    // arrive as classes with !important. If this block ever stops rendering,
    // dark-mode readers silently get the light sheet.
    expect(out).toMatch(/prefers-color-scheme:\s*dark/);
    expect(out).toContain(riso.dark.paper);
    expect(out).toContain("!important");
  });

  it("keeps the class hooks the dark rules target", async () => {
    const out = await html();
    // The media query is useless if React Email drops className on its
    // components -- these two have to travel together.
    for (const hook of ["hx-body", "hx-sheet", "hx-heading", "hx-text", "hx-action"]) {
      expect(out).toContain(hook);
    }
  });

  it("tells the client the palette is deliberate, to discourage auto-darkening", async () => {
    const out = await html();
    expect(out).toMatch(/name="color-scheme"/);
    expect(out).toMatch(/name="supported-color-schemes"/);
  });

  it("is square: depth in this language is a hairline, never a shadow", async () => {
    const out = await html();
    expect(out).not.toMatch(/border-radius:\s*[1-9]/);
    expect(out).not.toMatch(/box-shadow/);
  });

  it("is wider than the 600px email default", async () => {
    const out = await html();
    expect(out).toContain(`${SHEET_WIDTH}px`);
  });
});

describe("copy", () => {
  it("does not still call the service Forecasting", async () => {
    // Stale from the Sept 2026 rename; this pins it because the string is
    // user-facing and nothing else would catch it.
    const out = await html();
    expect(out).not.toContain("Forecasting");
    expect(out).toContain("Haruspex");
  });
});

describe("links", () => {
  it("points the masthead wordmark and the footer url at the site", async () => {
    const out = await html();
    const hrefs = [...out.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.filter((h) => h === SITE_URL)).toHaveLength(2);
  });

  it("paints every link from the riso palette, never a default blue", async () => {
    const out = await html();
    const anchors = [...out.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
    expect(anchors).toHaveLength(3); // masthead, action button, footer url

    // Asserting the presence of `color:` would prove nothing: React Email's
    // Link always emits one, and defaults it to its own blue. The assertion
    // has to name the value, or it passes just as happily on #067df7 -- the
    // one colour this palette has no room for.
    const allowed = [riso.light.muted, riso.light.paper];
    for (const a of anchors) {
      const colour = a.match(/style="color:(#[0-9a-f]{6})/)?.[1];
      expect(allowed).toContain(colour);
    }
    expect(out).not.toContain("#067df7");
  });

  it("flips both links with the edition", async () => {
    const out = await html();
    // hx-footer-link needs its own hook: the footer <p> rule does not reach
    // an <a> inside it once the anchor carries its own inline colour.
    expect(out).toContain("hx-footer-link");
    expect(out).toMatch(/\.hx-kicker[^}]*\{[^}]*!important/);
  });
});
