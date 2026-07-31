import app from "./app";
import { logger } from "./lib/logger";
import {
  ensureUserProfileColumns,
  ensureMatchAndFaqSchema,
  ensureVaultCapitalSchema,
  ensureAnalyticsEventsSchema,
  ensureLiveSessionColumns,
  ensureUserMembershipColumns,
  ensurePassSchema,
  ensureStageSchema,
  ensureOrgLegalCampaignSchema,
  ensurePasswordResetSchema,
} from "./lib/ensureSchema";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

Promise.all([
  ensureUserProfileColumns(),
  ensureMatchAndFaqSchema(),
  ensureVaultCapitalSchema(),
  ensureAnalyticsEventsSchema(),
  ensureLiveSessionColumns(),
  ensureUserMembershipColumns(),
  ensurePassSchema(),
  ensureStageSchema(),
  ensureOrgLegalCampaignSchema(),
  ensurePasswordResetSchema(),
])
  .catch((err) => {
    logger.warn({ err }, "Schema ensure failed (will retry on demand)");
  })
  .finally(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  });
