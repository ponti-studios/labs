import { readFile } from "node:fs/promises";

import type { FeedItem } from "../generation/types";

export interface SourceFixture {
  id: string;
  genre: string;
  sourceUrl: string;
  capturedAt: string;
  items: FeedItem[];
}

export async function readSourceFixture(path: string): Promise<SourceFixture> {
  const parsed: unknown = JSON.parse(await readFile(path, "utf-8"));
  if (!parsed || typeof parsed !== "object") throw new Error(`Invalid source fixture: ${path}`);
  const fixture = parsed as Partial<SourceFixture>;
  if (
    typeof fixture.id !== "string" ||
    typeof fixture.genre !== "string" ||
    typeof fixture.sourceUrl !== "string" ||
    !Array.isArray(fixture.items)
  ) {
    throw new Error(`Source fixture is missing required fields: ${path}`);
  }
  return fixture as SourceFixture;
}
