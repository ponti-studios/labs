-- =============================================================================
-- File: post_embedding_status.sql
-- Purpose: Provide a summary view of post embedding processing status
-- Origin: Monitoring view for the post embedding pipeline
-- Input: 'posts' table with embedding_status and embeddings columns
-- Output: Counts of posts in each embedding status category
-- =============================================================================

-- -----------------------------------------------------------------------------
-- QUERY OVERVIEW
-- Creates a simple status summary for the vector embedding processing pipeline.
-- Counts posts grouped by their current embedding_status value.
--
-- Status Values (typical):
--   - NULL / pending: Not yet processed for embeddings
--   - processing: Currently being processed by embedding API
--   - complete: Successfully processed, embeddings column is populated
--   - error: Processing failed
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- FILTER CLAUSE SYNTAX
-- COUNT(*) FILTER (WHERE condition) is a PostgreSQL aggregate filter clause.
-- It counts only rows where the condition is TRUE.
-- This is equivalent to: SUM(CASE WHEN condition THEN 1 ELSE 0 END)
-- -----------------------------------------------------------------------------

SELECT
  -- Count posts that have completed embedding generation
  -- Requirements: embeddings is not null AND status is 'complete'
  COUNT(*) FILTER (WHERE embeddings IS NOT NULL AND embedding_status = 'complete')
    AS is_completed,

  -- Count posts awaiting processing
  -- These have no embeddings yet and are in 'pending' or null status
  COUNT(*) FILTER (WHERE embedding_status = 'pending')
    AS is_pending,

  -- Count posts currently being processed
  -- These are in-flight, being sent to the embedding API
  COUNT(*) FILTER (WHERE embedding_status = 'processing')
    AS is_processing,

  -- Count posts that encountered errors during processing
  -- These may need manual intervention or automatic retry
  COUNT(*) FILTER (WHERE embedding_status = 'error')
    AS is_errored

FROM posts;

-- -----------------------------------------------------------------------------
-- USAGE NOTES
-- Run this query to get a quick overview of the embedding pipeline health.
-- For detailed error messages, join with posts.embedding_error column.
--
-- Example with error details:
-- SELECT id, title, embedding_status, embedding_error
-- FROM posts
-- WHERE embedding_status = 'error';
-- -----------------------------------------------------------------------------
