-- =============================================================================
-- File: 04_import_life_story_table.sql
-- Purpose: Import the 'life_events' table from an external Life Story database
-- Origin: Data migration for personal life events tracking
-- Input: 'life_story.db' - External SQLite database file containing life_events table
-- Usage: Typically run once during initial data setup to consolidate databases
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ATTACH DATABASE
-- Connects to the 'life_story.db' file and assigns it the alias 'life_story_db'.
-- This database is expected to contain at least one table: 'life_events'
--
-- Database Path: Relative to the current working directory when executing the script.
-- Ensure the file exists and is readable before running this script.
-- -----------------------------------------------------------------------------

ATTACH DATABASE 'life_story.db' AS life_story_db;

-- -----------------------------------------------------------------------------
-- COPY TABLE
-- Duplicates the 'life_events' table from the external database into the main database.
-- The new table will have the same schema and all data from the source.
--
-- Table Structure (inferred from source):
--   Likely contains columns for: event date, event description, category/tags,
--   location, people involved, and possibly media attachments.
--
-- Note: If the table already exists in the main database, this will fail.
-- Use 'CREATE TABLE IF NOT EXISTS' only if supported and if that's the intent.
-- -----------------------------------------------------------------------------

CREATE TABLE life_events AS SELECT * FROM life_story_db.life_events;

-- -----------------------------------------------------------------------------
-- DETACH DATABASE
-- Closes the connection to the external Life Story database.
-- -----------------------------------------------------------------------------

DETACH DATABASE life_story_db;
