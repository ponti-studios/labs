import { inArray, sql } from "drizzle-orm";

import { db } from "../drizzle";
import { searchDocuments, type NewSearchDocument } from "../schema/search";

const DEFAULT_BATCH_SIZE = 50;

export async function populateSearchCorpus(records: NewSearchDocument[]) {
  console.log("Starting search corpus population...");
  await db.delete(searchDocuments);
  console.log("Cleared existing search corpus");

  for (let index = 0; index < records.length; index += DEFAULT_BATCH_SIZE) {
    const batch = records.slice(index, index + DEFAULT_BATCH_SIZE);
    await db.insert(searchDocuments).values(batch);
    console.log(
      `Inserted search corpus batch ${Math.floor(index / DEFAULT_BATCH_SIZE) + 1}/${Math.ceil(records.length / DEFAULT_BATCH_SIZE)}`,
    );
  }

  console.log("Building weighted tsvector column");
  await db.update(searchDocuments).set({
    searchVector: sql`
        setweight(to_tsvector('english', coalesce(${searchDocuments.title}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.subtitle}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.category}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.location}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.summary}, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.body}, '')), 'D') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.searchText}, '')), 'D')
      `,
  });

  console.log(`Search corpus population complete: ${records.length} records`);
}

async function refreshSearchVectorRows(sourceUrls: string[]) {
  if (sourceUrls.length === 0) return;

  await db
    .update(searchDocuments)
    .set({
      searchVector: sql`
        setweight(to_tsvector('english', coalesce(${searchDocuments.title}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.subtitle}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.category}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.location}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.summary}, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.body}, '')), 'D') ||
        setweight(to_tsvector('english', coalesce(${searchDocuments.searchText}, '')), 'D')
      `,
    })
    .where(inArray(searchDocuments.sourceUrl, sourceUrls));
}

export async function appendSearchCorpus(records: NewSearchDocument[]) {
  console.log("Starting search corpus append...");

  for (let index = 0; index < records.length; index += DEFAULT_BATCH_SIZE) {
    const batch = records.slice(index, index + DEFAULT_BATCH_SIZE);
    await db.insert(searchDocuments).values(batch).onConflictDoNothing();

    await refreshSearchVectorRows(batch.map((record) => record.sourceUrl));
    console.log(
      `Appended search corpus batch ${Math.floor(index / DEFAULT_BATCH_SIZE) + 1}/${Math.ceil(records.length / DEFAULT_BATCH_SIZE)}`,
    );
  }

  console.log(`Search corpus append complete: ${records.length} records`);
}
