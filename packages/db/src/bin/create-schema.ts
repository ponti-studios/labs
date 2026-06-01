import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const sql = postgres(url, { max: 1 });
await sql`CREATE SCHEMA IF NOT EXISTS labs`;
await sql.end();
console.log("Schema ready");
