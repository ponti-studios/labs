-- =============================================================================
-- File: process_embeddings-v1.sql
-- Purpose: Batch process posts to generate vector embeddings via external API
-- Origin: First version of the embedding processing cron job function
--         for the hominem project (PostgreSQL database with Supabase Edge Functions)
-- Input: Posts table with NULL embeddings and 'pending' or NULL embedding_status
-- Output: Updates posts with generated embeddings, logs processing events
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FUNCTION: util.process_embeddings
--
-- This function processes posts in batches to generate vector embeddings using
-- an external API (likely a Supabase Edge Function called 'embed_posts').
--
-- Parameters:
--   batch_size: Number of posts to include in each API call (default: 10)
--   max_requests: Maximum number of API calls to make per function invocation (default: 10)
--   timeout_milliseconds: HTTP request timeout, defaults to 5 minutes (default: 300000ms)
--
-- Returns: void (procedural function that modifies database state)
--
-- Architecture:
--   1. Selects pending posts using SELECT FOR UPDATE SKIP LOCKED for concurrency
--   2. Updates posts to 'processing' status to prevent duplicate processing
--   3. Splits posts into batches
--   4. Calls external edge function for each batch
--   5. On success: updates posts with embeddings
--   6. On failure: resets posts to 'pending' and logs the error
--   7. Logs overall job completion with statistics
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION util.process_embeddings(
  batch_size integer DEFAULT 10,
  max_requests integer DEFAULT 10,
  timeout_milliseconds integer DEFAULT ((5 * 60) * 1000)
)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  -- Loop variable for iterating through batch arrays
  batch_record RECORD;

  -- Timing variables for performance logging
  start_time TIMESTAMP;
  end_time TIMESTAMP;

  -- Statistics counters
  total_posts INTEGER := 0;      -- Total posts successfully processed
  total_batches INTEGER := 0;    -- Total API calls made

  -- Error tracking
  error_occurred BOOLEAN := FALSE;
  error_message TEXT;

  -- Array to hold post IDs extracted from batch JSONB objects
  post_ids BIGINT[];
BEGIN
  -- Record the start time for performance measurement
  start_time := clock_timestamp();

  -- -----------------------------------------------------------------------------
  -- BATCH SELECTION AND STATUS UPDATE QUERY
  --
  -- This complex CTE does two things:
  --   1. Selects pending posts up to (max_requests * batch_size) rows
  --   2. Immediately updates them to 'processing' status with SKIP LOCKED
  --
  -- SKIP LOCKED: If another process is already processing a row, skip it instead
  --              of waiting. This enables parallel job execution without conflicts.
  --
  -- FOR UPDATE: Locks the selected rows so other transactions can't modify them
  --             until we commit or roll back.
  -- -----------------------------------------------------------------------------

  FOR batch_record IN
    WITH to_process AS (
      -- Select posts that need embedding generation
      SELECT id, text
      FROM "public"."posts"
      WHERE
        "embeddings" IS NULL
        AND ("embedding_status" = 'pending' OR "embedding_status" IS NULL)
      LIMIT max_requests * batch_size
      FOR UPDATE SKIP LOCKED  -- Lock rows, skip if already locked
    ),
    update_posts AS (
      -- Update selected posts to processing status, return the data
      UPDATE "public"."posts"
      SET
        "embedding_status" = 'processing',
        "embedding_error" = NULL
      WHERE id IN (SELECT id FROM to_process)
      RETURNING id, text
    ),
    numbered_jobs AS (
      -- Assign batch numbers to jobs using row_number()
      -- Batches are numbered 0, 1, 2, ... based on their position in the result set
      SELECT
        (row_number() OVER (ORDER BY 1) - 1) / batch_size AS batch_num,
        jsonb_build_object(
          'id', id,
          'text', text
        ) AS job_info
      FROM update_posts
    ),
    job_batches AS (
      -- Aggregate jobs into batch arrays grouped by batch number
      SELECT batch_num, array_agg(job_info) AS batch_array
      FROM numbered_jobs
      GROUP BY batch_num
      ORDER BY batch_num
    )
    -- Final selection: each row contains one batch's worth of jobs
    SELECT batch_array
    FROM job_batches
  LOOP
    -- -------------------------------------------------------------------------
    -- EXTRACT POST IDS FROM BATCH
    -- The batch_array is a PostgreSQL array of JSONB objects.
    -- We unnest it to get individual JSONB objects, then extract the 'id' field.
    -- This creates an array of post IDs for error handling.
    -- -------------------------------------------------------------------------

    SELECT array_agg((single_jsonb_element->>'id')::BIGINT)
    INTO post_ids
    FROM unnest(batch_record.batch_array) AS single_jsonb_element;

    BEGIN
      -- -----------------------------------------------------------------------
      -- CALL EXTERNAL EDGE FUNCTION
      -- Invokes the Supabase Edge Function 'embed_posts' which handles the actual
      -- API call to the embedding generation service (e.g., OpenAI, Cohere, etc.)
      -- -----------------------------------------------------------------------

      PERFORM util.invoke_edge_function(
        name => 'embed_posts',
        body => to_jsonb(batch_record.batch_array),
        timeout_milliseconds => timeout_milliseconds
      );

      -- Track successful batch processing
      total_batches := total_batches + 1;
      total_posts := total_posts + array_length(post_ids, 1);

    EXCEPTION WHEN others THEN
      -- -----------------------------------------------------------------------
      -- ERROR HANDLING
      -- If the API call fails, mark the error and reset posts to pending
      -- so they can be retried on the next job run.
      -- -----------------------------------------------------------------------

      error_occurred := TRUE;
      error_message := SQLERRM;

      -- Reset failed posts back to pending status for retry
      UPDATE "public"."posts"
      SET
        "embedding_status" = 'pending',
        "embedding_error" = error_message
      WHERE id = ANY(post_ids);

      -- Log the error to embedding_logs table for debugging
      INSERT INTO public.embedding_logs (
        event_type,
        message,
        error_details,
        batch_size
      ) VALUES (
        'error',
        format('Failed to process batch: %s', error_message),
        jsonb_build_object(
          'post_ids', post_ids,
          'error', error_message,
          'batch_size', array_length(post_ids, 1)
        ),
        array_length(post_ids, 1)
      );
    END;
  END LOOP;

  -- ---------------------------------------------------------------------------
  -- LOG JOB COMPLETION
  -- Records overall job statistics including total posts processed, batch count,
  -- processing duration, and whether any errors occurred.
  -- ---------------------------------------------------------------------------

  end_time := clock_timestamp();

  -- Only log if we processed something or encountered errors
  IF total_posts > 0 OR error_occurred THEN
    INSERT INTO public.embedding_logs (
      event_type,
      message,
      batch_size,
      processing_time_ms
    ) VALUES (
      'cron_completed',
      format(
        'Job completed: %s posts in %s batches%s',
        total_posts,
        total_batches,
        CASE WHEN error_occurred THEN ' (with errors)' ELSE '' END
      ),
      total_posts,
      extract(EPOCH FROM (end_time - start_time)) * 1000
    );
  END IF;
END;
$function$;

-- =============================================================================
-- NOTES FOR V2:
-- Version 2 simplified this function significantly by delegating all batch
-- logic to the edge function itself, passing parameters instead of pre-batched data.
-- See process_embeddings-v2.sql for the simplified implementation.
-- =============================================================================
