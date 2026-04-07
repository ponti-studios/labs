-- =============================================================================
-- File: 02_import_spotify_tables.sql
-- Purpose: Import all tables from an external Spotify SQLite database into the main database
-- Origin: Data migration script for consolidating Spotify data
-- Input: 'spotify.db' - External SQLite database file in the same directory
-- Tables Imported: artists, albums, tracks, playlists, playlist_tracks, streaming_history
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ATTACH DATABASE
-- Temporarily connects to the external 'spotify.db' file, assigning it the alias
-- 'spotify_db'. This allows us to query tables from that database using dot notation
-- (e.g., spotify_db.artists).
--
-- Note: The database file must exist and be readable by the current user.
-- -----------------------------------------------------------------------------

ATTACH DATABASE 'spotify.db' AS spotify_db;

-- -----------------------------------------------------------------------------
-- COPY TABLES
-- Creates new tables in the main database by copying all data from the corresponding
-- tables in the attached Spotify database. The schema and data are duplicated.
--
-- Tables being copied:
--   artists         - Spotify artist metadata
--   albums          - Album information linked to artists
--   tracks         - Individual track records with references to albums and artists
--   playlists       - User-created playlist definitions
--   playlist_tracks - Junction table linking playlists to their tracks (order matters)
--   streaming_history - Historical record of tracks played on Spotify
-- -----------------------------------------------------------------------------

CREATE TABLE artists AS SELECT * FROM spotify_db.artists;
CREATE TABLE albums AS SELECT * FROM spotify_db.albums;
CREATE TABLE tracks AS SELECT * FROM spotify_db.tracks;
CREATE TABLE playlists AS SELECT * FROM spotify_db.playlists;
CREATE TABLE playlist_tracks AS SELECT * FROM spotify_db.playlist_tracks;
CREATE TABLE streaming_history AS SELECT * FROM spotify_db.streaming_history;

-- -----------------------------------------------------------------------------
-- DETACH DATABASE
-- Closes the connection to the external database. This is good practice to
-- prevent accidental queries against the wrong database and to release resources.
-- -----------------------------------------------------------------------------

DETACH DATABASE spotify_db;
