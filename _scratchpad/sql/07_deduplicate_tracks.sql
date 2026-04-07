-- =============================================================================
-- File: 07_deduplicate_tracks.sql
-- Purpose: Remove duplicate track entries while preserving the first occurrence
-- Origin: Data cleanup after importing tracks from Spotify database
-- Input: 'tracks' table with potential duplicate entries based on (name, artist_id)
-- Strategy: Keep the row with the smallest ID for each unique (name, artist_id) pair
-- =============================================================================

-- -----------------------------------------------------------------------------
-- DEDUPLICATION STRATEGY
-- Duplicate tracks can occur due to:
--   - Multiple albums with the same name by the same artist (e.g., deluxe editions)
--   - Data inconsistencies in the source Spotify database
--   - Manual data entry errors
--
-- This script keeps the entry with the lowest ID (typically the first one added)
-- and removes all others, ensuring each (track name, artist) combination is unique.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- STEP 1: Create Temporary Deduplicated Table
-- Selects all rows from tracks where the ID is the minimum ID for that
-- (name, artist_id) combination. This effectively keeps only the first
-- occurrence of each unique track-artist pair.
--
-- GROUP BY creates groups for each (name, artist_id) pair.
-- MIN(id) returns the smallest ID within each group.
-- The outer WHERE clause filters to only include rows whose ID matches
-- the minimum ID for their group - thus keeping only the first occurrence.
-- -----------------------------------------------------------------------------

CREATE TABLE tracks_unique AS
SELECT * FROM tracks
WHERE id IN (
    SELECT MIN(id)
    FROM tracks
    GROUP BY name, artist_id
);

-- -----------------------------------------------------------------------------
-- STEP 2: Drop the Original Table
-- Removes the original tracks table containing duplicates.
--
-- WARNING: This is a destructive operation. Ensure Step 1 completed successfully
-- and the tracks_unique table contains the expected data before proceeding.
-- -----------------------------------------------------------------------------

DROP TABLE tracks;

-- -----------------------------------------------------------------------------
-- STEP 3: Rename Temporary Table to Original Name
-- Renames tracks_unique to tracks, effectively replacing the original table
-- with the deduplicated version.
--
-- Alternative approach: Could use INSERT INTO ... SELECT instead of creating
-- a new table and swapping, but this approach is safer for data recovery
-- (the duplicate data remains in tracks_unique until verified).
-- -----------------------------------------------------------------------------

ALTER TABLE tracks_unique RENAME TO tracks;
