-- =============================================================================
-- File: 06_clean_markdown_entries.sql
-- Purpose: Clean up imported Markdown entries by removing drafts and fixing formatting
-- Origin: Data cleanup after importing markdown_entries from db.sqlite
-- Input: 'markdown_entries' table with potentially dirty data
-- Operations: Delete drafts, fix leading character artifacts
-- =============================================================================

-- -----------------------------------------------------------------------------
-- OPERATION 1: Remove Draft Entries
-- Deletes all rows from markdown_entries where the text content contains
-- the draft status marker.
--
-- Why: Draft entries are typically not meant for publication and should be
-- removed from production datasets to avoid confusion or accidental publishing.
--
-- The marker '--- status: draft' is a YAML frontmatter convention commonly used
-- in static site generators like Jekyll, Hugo, or Eleventy to indicate metadata.
-- -----------------------------------------------------------------------------

DELETE FROM markdown_entries WHERE text LIKE '%--- status: draft%';

-- -----------------------------------------------------------------------------
-- OPERATION 2: Strip Leading Dash-Space from Text
-- Updates the text column to remove the first two characters ('- ') from entries
-- that start with that sequence.
--
-- Why: Some Markdown exports or manual entries may have a leading '- ' prefix
-- (list item syntax) that was unintentionally included during data entry or
-- the export process. This removes that artifact.
--
-- Implementation:
--   SUBSTR(text, 1, 2) = '- '  : Checks if first 2 chars are dash-space
--   SUBSTR(text, 3)           : Returns text starting from character 3 onward
--
-- Safety: Only affects rows where the pattern matches, so safe to run.
-- -----------------------------------------------------------------------------

UPDATE markdown_entries SET text = SUBSTR(text, 3) WHERE SUBSTR(text, 1, 2) = '- ';
