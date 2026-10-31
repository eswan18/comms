import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import * as React from "react";
import { Html, Body } from "@react-email/components";
import { MarkdownBody, isSafeHref } from "../../src/emails/markdown-body.js";

function md(source: string): Promise<string> {
  return render(
    <Html>
      <Body>
        <MarkdownBody source={source} />
      </Body>
    </Html>,
  );
}

describe("MarkdownBody", () => {
  it("renders headings, bold, italic and paragraphs", async () => {
    const html = await md("Intro.\n\n## New Site Name\n\n**Bold** and *italic*.");

    expect(html).toMatch(/<h2[^>]*>New Site Name<\/h2>/);
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toMatch(/<p[^>]*>Intro\.<\/p>/);
  });

  it("keeps a single line break as a line break", async () => {
    const html = await md("Thanks,\nEthan");

    expect(html).toMatch(/Thanks,<br\/?>Ethan/);
  });

  it("renders links with the hx-link class", async () => {
    const html = await md("[Suggest one](https://haruspex.fyi/props/suggest)");

    expect(html).toContain('href="https://haruspex.fyi/props/suggest"');
    expect(html).toContain("hx-link");
    expect(html).toContain("Suggest one");
  });

  it("renders bullet and numbered lists", async () => {
    const html = await md("- one\n- two\n\n1. first\n2. second");

    expect(html).toMatch(/<ul[^>]*>.*<li[^>]*>one<\/li>.*<\/ul>/s);
    expect(html).toMatch(/<ol[^>]*>.*<li[^>]*>first<\/li>.*<\/ol>/s);
  });

  it("prints raw HTML as text instead of rendering it", async () => {
    const html = await md('<script>alert("x")</script>\n\nHi <b>there</b>');

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;");
  });

  it("drops a link with an unsafe scheme but keeps its words", async () => {
    const html = await md("[click](javascript:alert(1))");

    expect(html).not.toContain("javascript:");
    expect(html).toContain("click");
  });

  it("escapes quotes in a link so they cannot break out of the attribute", async () => {
    const html = await md('[x](https://a.example/"onmouseover="alert(1))');

    expect(html).not.toMatch(/"\s*onmouseover=/);
  });
});

describe("isSafeHref", () => {
  it("allows http, https and mailto", () => {
    expect(isSafeHref("https://haruspex.fyi")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(true);
    expect(isSafeHref("mailto:a@example.com")).toBe(true);
  });

  it("refuses everything else, including relative links", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,hi")).toBe(false);
    expect(isSafeHref("/props/suggest")).toBe(false);
  });
});
