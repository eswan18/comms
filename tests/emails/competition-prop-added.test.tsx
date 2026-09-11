import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { CompetitionPropAdded } from "../../src/emails/competition-prop-added.js";

const base = {
  recipientName: "Ethan",
  competitionName: "Office Pool",
  propText: "It snows on the first of December.",
  forecastsDueDate: "2026-11-30T17:00:00.000Z",
  actionUrl: "https://haruspex.fyi/competitions/3/props/42",
};

describe("CompetitionPropAdded template", () => {
  it("renders the recipient, the competition and the claim", async () => {
    const html = await render(CompetitionPropAdded(base));

    expect(html).toContain("Ethan");
    expect(html).toContain("Office Pool");
    expect(html).toContain("It snows on the first of December.");
  });

  it("gives the forecast deadline in UTC, and says so", async () => {
    const html = await render(CompetitionPropAdded(base));

    // The reader's timezone is unknowable from an email, and the new-prop
    // form takes deadlines in UTC, so the deadline is stated in UTC.
    expect(html).toContain("Nov 30, 2026, 5:00 PM UTC");
  });

  it("leaves the deadline out when there is none", async () => {
    const html = await render(
      CompetitionPropAdded({ ...base, forecastsDueDate: null }),
    );

    expect(html).not.toContain("Forecasts close");
  });

  it("leaves the deadline out rather than printing an invalid date", async () => {
    const html = await render(
      CompetitionPropAdded({ ...base, forecastsDueDate: "not a date" }),
    );

    expect(html).not.toContain("Invalid Date");
    expect(html).not.toContain("Forecasts close");
  });

  it("links to the prop", async () => {
    const html = await render(CompetitionPropAdded(base));

    expect(html).toContain('href="https://haruspex.fyi/competitions/3/props/42"');
    expect(html).toContain("Make your forecast");
  });

  it("escapes HTML in the claim", async () => {
    const html = await render(
      CompetitionPropAdded({ ...base, propText: '<script>alert("x")</script>' }),
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
