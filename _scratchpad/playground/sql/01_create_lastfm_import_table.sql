-- =============================================================================
-- File: 01_create_lastfm_import_table.sql
-- Purpose: Create the initial staging table for importing Last.fm listening data
-- Origin: Used to bootstrap the Last.fm data import pipeline
-- Input: Expects data to be loaded from 'lastfm.csv' via SQLite's .import command
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Creates a denormalized staging table to hold raw Last.fm track listening data.
-- Each row represents a single track play event with artist, album, track name,
-- and the timestamp when it was played.
--
-- Schema Design:
--   - id: Auto-incrementing primary key for SQLite compatibility
--   - artist: Name of the track artist (TEXT, no constraints)
--   - album: Name of the album the track belongs to (TEXT, no constraints)
--   - track: Name of the track (TEXT, no constraints)
--   - date: Playback timestamp in string format (TEXT, parsed from CSV)
--
-- Usage: After creating this table, load data using:
--   .mode csv
--   .import lastfm.csv lastfm_tracks
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lastfm_tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist TEXT,
    album TEXT,
    track TEXT,
    date TEXT
);
