import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseEmailFromOverrides,
  createEmailFromResolver,
} from "../src/email-from.js";

describe("parseEmailFromOverrides", () => {
  it("returns an empty map when unset", () => {
    expect(parseEmailFromOverrides(undefined)).toEqual({});
  });

  it("returns an empty map for an empty string", () => {
    expect(parseEmailFromOverrides("")).toEqual({});
  });

  it("parses a source-to-address map", () => {
    expect(
      parseEmailFromOverrides(
        '{"forecasting":"Haruspex <noreply@mail.haruspex.fyi>"}',
      ),
    ).toEqual({ forecasting: "Haruspex <noreply@mail.haruspex.fyi>" });
  });

  it("parses multiple sources", () => {
    expect(
      parseEmailFromOverrides(
        '{"forecasting":"a@example.com","footstrike":"b@example.com"}',
      ),
    ).toEqual({
      forecasting: "a@example.com",
      footstrike: "b@example.com",
    });
  });

  it("throws on malformed JSON rather than silently ignoring it", () => {
    expect(() => parseEmailFromOverrides("{not json")).toThrow(
      /EMAIL_FROM_OVERRIDES/,
    );
  });

  it("throws when the JSON is not an object", () => {
    expect(() => parseEmailFromOverrides('["a@example.com"]')).toThrow(
      /EMAIL_FROM_OVERRIDES/,
    );
  });

  it("throws when an entry is not a non-empty string", () => {
    expect(() => parseEmailFromOverrides('{"forecasting":null}')).toThrow(
      /forecasting/,
    );
    expect(() => parseEmailFromOverrides('{"forecasting":"  "}')).toThrow(
      /forecasting/,
    );
  });
});

describe("createEmailFromResolver", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the override for a matching source", () => {
    const resolve = createEmailFromResolver("default@example.com", {
      forecasting: "Haruspex <noreply@mail.haruspex.fyi>",
    });
    expect(resolve("forecasting")).toBe(
      "Haruspex <noreply@mail.haruspex.fyi>",
    );
  });

  it("falls back to the default for an unknown source", () => {
    const resolve = createEmailFromResolver("default@example.com", {
      forecasting: "Haruspex <noreply@mail.haruspex.fyi>",
    });
    expect(resolve("identity")).toBe("default@example.com");
  });

  it("falls back to the default when no overrides are configured", () => {
    const resolve = createEmailFromResolver("default@example.com", {});
    expect(resolve("forecasting")).toBe("default@example.com");
  });

  it("warns once per source that falls back, so a typo is visible in logs", () => {
    const resolve = createEmailFromResolver("default@example.com", {
      forecasting: "Haruspex <noreply@mail.haruspex.fyi>",
    });

    resolve("forcasting");
    resolve("forcasting");
    resolve("identity");

    expect(console.warn).toHaveBeenCalledTimes(2);
    expect(vi.mocked(console.warn).mock.calls[0]?.[0]).toContain("forcasting");
    expect(vi.mocked(console.warn).mock.calls[1]?.[0]).toContain("identity");
  });

  it("does not warn when an override matches", () => {
    const resolve = createEmailFromResolver("default@example.com", {
      forecasting: "Haruspex <noreply@mail.haruspex.fyi>",
    });
    resolve("forecasting");
    expect(console.warn).not.toHaveBeenCalled();
  });
});
