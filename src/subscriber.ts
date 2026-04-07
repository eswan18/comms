import { PubSub, type Message } from "@google-cloud/pubsub";
import { handleEvent } from "./handler.js";
import type { BaseEvent } from "./types.js";

export function startSubscriber(
  projectId: string,
  subscriptionNames: string[],
  emailFrom: string,
): () => Promise<void> {
  const pubsub = new PubSub({ projectId });
  const subscriptions = subscriptionNames.map((name) => {
    const subscription = pubsub.subscription(name);
    console.log(`Listening on subscription: ${name}`);

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
    subscription.on("error", (err) => {
      console.error(`Subscription ${name} error:`, err);
    });

    return subscription;
  });

  return async () => {
    console.log("Closing subscriptions...");
    await Promise.all(subscriptions.map((sub) => sub.close()));
  };
}
