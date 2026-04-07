-- =============================================================================
-- File: process_embeddings-v2.sql
-- Purpose: Simplified batch processing for post embeddings via external API
-- Origin: Refactored version of process_embeddings (v1) for the hominem project
--         This version delegates batching logic to the edge function
-- Input: Posts table with NULL embeddings and 'pending' or NULL embedding_status
-- Output: Delegates to edge function which handles batching internally
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FUNCTION: util.process_embeddings (Version 2)
--
-- This is a simplified version compared to v1. Instead of pre-batching posts
-- in PostgreSQL, this function passes parameters to the edge function and lets
-- the edge function handle the batching logic.
--
-- Key Changes from v1:
--   - No more CTE-based batch selection and locking in PostgreSQL
--   - No more FOR UPDATE SKIP LOCKED concurrency control
--   - No more manual post ID extraction from JSONB arrays
--   - No more per-batch error handling and retry logic in PostgreSQL
--   - Simpler interface: just pass parameters to the edge function
--
-- Benefits:
--   - Much simpler SQL function
--   - Edge function has more flexibility in batching logic
--   - Can be easily extended to use different embedding providers
--   - Better separation of concerns
--
-- Trade-offs:
--   - Less visibility into individual post processing status
--   - Harder to track partial failures within a batch
--   - Requires the edge function to be robust and well-tested
--
-- Parameters:
--   batch_size: Number of posts per batch (passed to edge function)
--   max_requests: Max API calls to make (passed to edge function)
--   timeout_milliseconds: HTTP timeout (passed to edge function)
--
-- Returns: void
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION util.process_embeddings(
  batch_size integer DEFAULT 10,
  max_requests integer DEFAULT 10,
  timeout_milliseconds integer DEFAULT ((5 * 60) * 1000)
)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- -----------------------------------------------------------------------------
  -- INVOKE EDGE FUNCTION
  -- Calls the 'embed_posts' Supabase Edge Function with configuration parameters.
  -- The edge function is responsible for:
  --   1. Selecting pending posts
  --   2. Batching them according to batch_size
  --   3. Calling the embedding API
  --   4. Updating post records with results
  --   5. Handling errors and retries
  --
  -- The timeout passed here includes a 30-second buffer for HTTP connection
  -- overhead beyond the actual API call timeout. This prevents premature timeouts
  -- due to connection setup, DNS lookup, TLS handshake, etc.
  -- -----------------------------------------------------------------------------

  PERFORM util.invoke_edge_function(
    name => 'embed_posts',
    body => jsonb_build_object(
      'batch_size', batch_size,
      'max_requests', max_requests,
      'timeout_milliseconds', timeout_milliseconds
    ),
    timeout_milliseconds => timeout_milliseconds + 30000  -- 30s buffer
  );
END;
$function$
;

-- =============================================================================
-- ARCHITECTURE NOTES
-- =============================================================================
--
-- The separation of concerns between PostgreSQL and the Edge Function:
--
-- PostgreSQL (this function):
--   - Manages the overall job scheduling
--   - Passes configuration to edge function
--   - Could be extended to handle job queuing, priority, rate limiting
--
-- Edge Function (embed_posts):
--   - Handles API interaction details
--   - Manages batching logic
--   - Processes results and updates database
--   - Implements retry logic with exponential backoff
--
-- This architecture allows for:
--   - Easier testing of embedding logic in isolation
--   - Different batching strategies without SQL changes
--   - Support for multiple embedding providers
--   - Simpler SQL migrations
-- =============================================================================
