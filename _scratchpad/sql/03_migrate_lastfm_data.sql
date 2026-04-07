-- =============================================================================
-- File: 03_migrate_lastfm_data.sql
-- Purpose: Normalize denormalized Last.fm data into a proper relational schema
-- Origin: Data migration from denormalized 'lastfm_tracks' to normalized tables
--         (artists, albums, tracks)
-- Input: 'lastfm_tracks' staging table created by 01_create_lastfm_import_table.sql
--         This was originally executed via a Python script that iterated row by row,
--         but SQLite's set-based operations are far more efficient.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MIGRATION STRATEGY
-- The Last.fm export provides data in a flat/denormalized format where artist,
-- album, and track names are repeated in every row. This script normalizes the
-- data into a proper schema with separate tables for artists, albums, and tracks,
-- linked by foreign keys. This reduces data redundancy and enables proper joins.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- STEP 1: Populate the 'artists' table
-- Inserts distinct artist names from the staging table into the normalized artists table.
-- INSERT OR IGNORE ensures we don't create duplicates if the table already has some artists.
-- The DISTINCT keyword guarantees each artist appears only once in the SELECT results.
-- -----------------------------------------------------------------------------

INSERT OR IGNORE INTO artists (name) SELECT DISTINCT artist FROM lastfm_tracks;

-- -----------------------------------------------------------------------------
-- STEP 2: Populate the 'albums' table
-- Links each unique album to its parent artist.
-- JOIN connects lastfm_tracks to artists on name matching.
-- The album's artist_id foreign key is set by looking up the artist's internal ID.
--
-- Note: The JOIN may create duplicate album entries if the same album appears
-- under slightly different names (e.g., "Greatest Hits" vs "Greatest Hits (Remastered)").
-- -----------------------------------------------------------------------------

INSERT OR IGNORE INTO albums (name, artist_id)
SELECT DISTINCT lt.album, ar.id
FROM lastfm_tracks lt
JOIN artists ar ON lt.artist = ar.name;

-- -----------------------------------------------------------------------------
-- STEP 3: Populate the 'tracks' table
-- Creates track entries linked to both their album and artist.
-- Requires matching on album name AND artist ID to correctly identify albums,
-- since album names alone may not be unique across different artists.
--
-- Example: Two different artists might have an album called "Greatest Hits"
-- -----------------------------------------------------------------------------

INSERT OR IGNORE INTO tracks (name, album_id, artist_id)
SELECT DISTINCT lt.track, al.id, ar.id
FROM lastfm_tracks lt
JOIN artists ar ON lt.artist = ar.name
JOIN albums al ON lt.album = al.name AND ar.id = al.artist_id;

-- -----------------------------------------------------------------------------
-- STEP 4: Clean up the staging table
-- The lastfm_tracks table has served its purpose. Drop it to free up space
-- and prevent confusion with the normalized tables.
-- -----------------------------------------------------------------------------

DROP TABLE lastfm_tracks;
