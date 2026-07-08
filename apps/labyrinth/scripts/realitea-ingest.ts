import "dotenv/config";

import { closeDb } from "@pontistudios/db";

import { getErrorMessage } from "../app/lib/errors";
import { ingestAllActiveFeeds } from "../app/lib/realitea/ingest";
import { createLogger } from "../app/lib/logger.server";
import { LabyrinthServerEnv } from "../app/lib/server/env";

const logger = createLogger();

async function main() {
  LabyrinthServerEnv.parse(process.env);

  const ingestLogger = logger.child({ operation: "realiteaIngest" });
  ingestLogger.info({ event: "[INGEST_START]" }, "starting feed ingest run");

  const insertedCount = await ingestAllActiveFeeds();

  ingestLogger.info(
    { event: "[INGEST_COMPLETE]", insertedCount },
    `ingest complete: ${insertedCount} new article(s)`,
  );
}

if (!process.env.VITEST) {
  try {
    await main();
  } catch (err) {
    logger.error({ event: "[INGEST_FAILED]", error: getErrorMessage(err) }, "ingest run failed");
    process.exit(1);
  } finally {
    closeDb();
  }
}
