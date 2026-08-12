import { ensureRealiteaCatalog, ingestAllActiveFeeds } from "../app/lib/realitea/generation/ingest.server";
import { createLogger } from "../app/lib/logger.server";
import { runScript } from "./_shared/run-script";

const logger = createLogger();

async function main() {
  const ingestLogger = logger.child({ operation: "realiteaIngest" });
  ingestLogger.info({ event: "[INGEST_START]" }, "starting feed ingest run");

  await ensureRealiteaCatalog();
  const insertedCount = await ingestAllActiveFeeds();

  ingestLogger.info(
    { event: "[INGEST_COMPLETE]", insertedCount },
    `ingest complete: ${insertedCount} new article(s)`,
  );
}

if (!process.env.VITEST) await runScript(main);
