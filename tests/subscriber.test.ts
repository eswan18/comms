import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";

class FakeSubscription extends EventEmitter {
  close = vi.fn().mockResolvedValue(undefined);
}

// Every pubsub.subscription(name) call hands out a fresh fake, recorded per
// name so tests can assert how many times a subscription was (re-)attached.
const instances = new Map<string, FakeSubscription[]>();

function attachedCount(name: string): number {
  return instances.get(name)?.length ?? 0;
}

function latest(name: string): FakeSubscription {
  const list = instances.get(name);
  if (!list || list.length === 0) throw new Error(`no instances of ${name}`);
  return list[list.length - 1];
}

vi.mock("@google-cloud/pubsub", () => ({
  PubSub: vi.fn().mockImplementation(() => ({
    subscription: (name: string) => {
      const sub = new FakeSubscription();
      instances.set(name, [...(instances.get(name) ?? []), sub]);
      return sub;
    },
  })),
}));

vi.mock("../src/handler.js", () => ({
  handleEvent: vi.fn().mockResolvedValue(undefined),
}));

import { startSubscriber } from "../src/subscriber.js";
import { handleEvent } from "../src/handler.js";

const flushMicrotasks = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

describe("startSubscriber", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    instances.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("processes and acks messages", async () => {
    startSubscriber("proj", ["sub-a"], "from@example.com");
    const message = {
      id: "m1",
      data: Buffer.from(JSON.stringify({ event_type: "test.notification" })),
      ack: vi.fn(),
      nack: vi.fn(),
    };
    latest("sub-a").emit("message", message);
    await flushMicrotasks();
    expect(handleEvent).toHaveBeenCalledOnce();
    expect(message.ack).toHaveBeenCalledOnce();
    expect(message.nack).not.toHaveBeenCalled();
  });

  it("re-attaches after a terminal error, with exponential backoff", () => {
    startSubscriber("proj", ["sub-a"], "from@example.com");
    expect(attachedCount("sub-a")).toBe(1);

    latest("sub-a").emit("error", new Error("NOT_FOUND"));
    expect(latest("sub-a").close).toHaveBeenCalledOnce();

    // First retry after 5s.
    vi.advanceTimersByTime(4_999);
    expect(attachedCount("sub-a")).toBe(1);
    vi.advanceTimersByTime(1);
    expect(attachedCount("sub-a")).toBe(2);

    // Second failure backs off to 10s.
    latest("sub-a").emit("error", new Error("NOT_FOUND"));
    vi.advanceTimersByTime(5_000);
    expect(attachedCount("sub-a")).toBe(2);
    vi.advanceTimersByTime(5_000);
    expect(attachedCount("sub-a")).toBe(3);
  });

  it("a broken subscription does not disturb its siblings", () => {
    startSubscriber("proj", ["sub-a", "sub-b"], "from@example.com");
    latest("sub-a").emit("error", new Error("NOT_FOUND"));
    vi.advanceTimersByTime(60_000);
    expect(attachedCount("sub-a")).toBe(2);
    expect(attachedCount("sub-b")).toBe(1);
    expect(latest("sub-b").close).not.toHaveBeenCalled();
  });

  it("resets the backoff after a stable period", () => {
    startSubscriber("proj", ["sub-a"], "from@example.com");

    latest("sub-a").emit("error", new Error("NOT_FOUND"));
    vi.advanceTimersByTime(5_000); // re-attach #2 (attempts now 1)
    expect(attachedCount("sub-a")).toBe(2);

    vi.advanceTimersByTime(60_000); // stable long enough: attempts reset

    latest("sub-a").emit("error", new Error("NOT_FOUND"));
    vi.advanceTimersByTime(5_000); // back to the base delay, not 10s
    expect(attachedCount("sub-a")).toBe(3);
  });

  it("close() cancels pending re-attaches and closes live subscriptions", async () => {
    const close = startSubscriber("proj", ["sub-a", "sub-b"], "from@example.com");

    latest("sub-a").emit("error", new Error("NOT_FOUND")); // pending re-attach
    const liveB = latest("sub-b");

    await close();
    vi.advanceTimersByTime(10 * 60_000);

    expect(attachedCount("sub-a")).toBe(1); // never re-attached
    expect(liveB.close).toHaveBeenCalledOnce();
  });
});
