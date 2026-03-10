import postgres from "postgres";
import * as schema from "@pontistudios/db/schema";
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
  $client: postgres.Sql<{}>;
};
export { schema };
//# sourceMappingURL=db.d.ts.map
