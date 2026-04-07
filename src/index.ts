import { loadConfig } from "./config.js";
import { startHealthServer } from "./health.js";
import { initMailer } from "./mailer.js";
import { startSubscriber } from "./subscriber.js";

const config = loadConfig();

initMailer(config.resendApiKey);

const healthServer = startHealthServer(config.port);
const closeSubscriber = startSubscriber(
  config.gcpProjectId,
  config.pubsubSubscriptions,
  config.emailFrom,
);

console.log(`Comms service started (env=${config.env})`);

const shutdown = async () => {
  console.log("Shutting down...");
  await closeSubscriber();
  healthServer.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
