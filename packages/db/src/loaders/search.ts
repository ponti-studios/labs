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

  console.log(`Search corpus population complete: ${records.length} records`);
}
