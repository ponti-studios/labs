-- =============================================================================
-- File: 05_import_db_sqlite_tables.sql
-- Purpose: Import multiple tables from a general-purpose SQLite database ('db.sqlite')
-- Origin: Data consolidation migration script
-- Input: 'db.sqlite' - External SQLite database file
-- Tables Imported:
--   - markdown_entries: Blog posts or notes written in Markdown format
--   - venues: Location/place records (possibly for events or check-ins)
--   - owid-covid-data: Our World in Data COVID-19 statistics (large dataset)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ATTACH DATABASE
-- Connects to the external 'db.sqlite' database file.
-- This database may contain various tables from different projects/sources.
-- Only the tables needed for the current migration are copied.
-- -----------------------------------------------------------------------------

ATTACH DATABASE 'db.sqlite' AS db_sqlite;

-- -----------------------------------------------------------------------------
-- COPY TABLES
-- Each CREATE TABLE AS SELECT copies data from the external database into a
-- new table in the main database. The tables are created with the same schema
-- as the source tables.
--
-- markdown_entries:
--   Likely stores text content with columns like id, title, text/content,
--   created_at, updated_at, author, tags, status (published/draft), etc.
--
-- venues:
--   Location data possibly including name, address, coordinates (lat/lng),
--   category, capacity, amenities, contact info, etc.
--
-- owid-covid-data:
--   Large dataset from Our World in Data containing COVID-19 statistics
--   by country/region including cases, deaths, vaccinations, testing, etc.
--   This table can be very large (thousands of rows and many columns).
-- -----------------------------------------------------------------------------

CREATE TABLE markdown_entries AS SELECT * FROM db_sqlite.markdown_entries;
CREATE TABLE venues AS SELECT * FROM db_sqlite.venues;
CREATE TABLE "owid-covid-data" AS SELECT * FROM db_sqlite."owid-covid-data";

-- -----------------------------------------------------------------------------
-- DETACH DATABASE
-- Closes the connection to the external database after migration is complete.
-- -----------------------------------------------------------------------------

DETACH DATABASE db_sqlite;
