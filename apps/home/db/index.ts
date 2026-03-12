import { env } from "@/lib/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { covidData, tflCameras } from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;

function initializeDb() {
	if (_db) return _db;

	const connectionString = env.DATABASE_URL;
	_client = postgres(connectionString);
	_db = drizzle(_client, { schema: { covidData, tflCameras } });
	return _db;
}

// Getter that initializes the database connection lazily
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(target, prop) {
		const dbInstance = initializeDb();
		return (dbInstance as any)[prop];
	},
});

export { covidData, tflCameras } from "./schema";
