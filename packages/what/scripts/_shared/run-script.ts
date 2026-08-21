import "dotenv/config";

import { closeDb } from "@pontistudios/db";
import { LabyrinthServerEnv } from "~/lib/server/env";

export async function runScript(main: () => Promise<void>): Promise<void> {
  LabyrinthServerEnv.parse(process.env);

  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    closeDb();
  }
}
