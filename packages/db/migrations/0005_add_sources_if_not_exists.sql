-- Migration 0005: Add the `sources` column if it doesn't already exist.
--
-- This is a safe, idempotent migration. It exists because the prior migration
-- (0004_realitea_restructure_sources) was never applied to the production
-- database — a stale `drizzle.__drizzle_migrations` entry caused drizzle-kit
-- to skip it. Local databases already have the column (applied via 0004), so
-- `IF NOT EXISTS` ensures this is a no-op where it already exists.
--
-- See: https://github.com/pontistudios/labs/issues/...

ALTER TABLE "labs"."rhobh_daily_puzzles"
  ADD COLUMN IF NOT EXISTS "sources" jsonb NOT NULL DEFAULT '[]'::jsonb;
