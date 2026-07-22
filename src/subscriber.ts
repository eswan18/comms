import { PubSub, type Message, type Subscription } from "@google-cloud/pubsub";
import { handleEvent } from "./handler.js";
import type { BaseEvent } from "./types.js";

// The client only retries transient stream failures internally; a terminal
// error (subscription missing, deleted, or recreated) kills the stream for
// good. Re-attach a fresh Subscription after a capped exponential backoff so
// one broken subscription can't silently drop out while its siblings keep
// consuming.
const BASE_RETRY_MS = 5_000;
const MAX_RETRY_MS = 5 * 60_000;
const STABLE_AFTER_MS = 60_000;

type SubscriptionState = {
  subscription?: Subscription;
  reattachTimer?: NodeJS.Timeout;
  stableTimer?: NodeJS.Timeout;
  attempts: number;
};

export function startSubscriber(
  projectId: string,
  subscriptionNames: string[],
  emailFrom: string,
): () => Promise<void> {
  const pubsub = new PubSub({ projectId });
  const states = new Map<string, SubscriptionState>();
  let closed = false;

  const attach = (name: string) => {
    if (closed) return;
    const state = states.get(name) ?? { attempts: 0 };
    states.set(name, state);
    state.reattachTimer = undefined;

    const subscription = pubsub.subscription(name);
    state.subscription = subscription;
    console.log(`Listening on subscription: ${name}`);

    // A subscription that stays healthy for a while earns a backoff reset,
    // so occasional flaps don't creep toward the max delay permanently.
    state.stableTimer = setTimeout(() => {
      state.attempts = 0;
    }, STABLE_AFTER_MS);

    const onMessage = async (message: Message) => {
      try {
        const event: BaseEvent = JSON.parse(message.data.toString("utf-8"));
        await handleEvent(event, emailFrom);
        message.ack();
      } catch (err) {
        console.error(`Error processing message ${message.id}:`, err);
        message.nack();
      }
    };

    subscription.on("message", onMessage);
    subscription.once("error", (err) => {
      console.error(`Subscription ${name} error:`, err);
      clearTimeout(state.stableTimer);
      state.stableTimer = undefined;
      state.subscription = undefined;
      subscription.close().catch(() => {
        // The stream is already dead; nothing useful to do with a close error.
      });
      if (closed) return;
      const delay = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** state.attempts);
      state.attempts += 1;
      console.log(
        `Re-attaching subscription ${name} in ${Math.round(delay / 1000)}s (attempt ${state.attempts})`,
      );
      state.reattachTimer = setTimeout(() => attach(name), delay);
    });
  };

  for (const name of subscriptionNames) attach(name);

  return async () => {
    console.log("Closing subscriptions...");
    closed = true;
    const open: Subscription[] = [];
    for (const state of states.values()) {
      clearTimeout(state.reattachTimer);
      clearTimeout(state.stableTimer);
      if (state.subscription) open.push(state.subscription);
    }
    states.clear();
    await Promise.all(open.map((sub) => sub.close().catch(() => {})));
  };
}
