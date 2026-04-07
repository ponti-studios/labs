-- =============================================================================
-- File: crons.sql
-- Purpose: Reference queries for pg_cron job monitoring and management
-- Origin: PostgreSQL cron job administration for embedding processing pipelines
-- Note: These are reference queries, not executable migration scripts
--       Uncomment specific lines to run them interactively
-- =============================================================================

-- -----------------------------------------------------------------------------
-- VIEW pg_cron JOB RUN HISTORY
-- Queries the metadata tables that pg_cron maintains for job executions.
--
-- pg_cron tables:
--   cron.job              - Job definitions (schedule, command, etc.)
--   cron.job_run_details  - Historical log of each job run with status and output
--
-- Usage: Run periodically to monitor job health and troubleshoot failures.
-- -----------------------------------------------------------------------------

-- View all job run details, most recent first
-- SELECT * FROM cron.job_run_details ORDER BY runid DESC;

-- -----------------------------------------------------------------------------
-- PG_CRON JOB SCHEDULE EXAMPLES (commented out)
-- These show the syntax for creating scheduled jobs using pg_cron's API.
-- Uncomment and modify to create new scheduled tasks.
--
-- Syntax: cron.schedule(job_name, schedule, command)
-- Schedule format: minute hour day-of-month month day-of-week
--   * = any value
--   Example: '* * * * *' = every minute
--           '0 * * * *' = every hour at minute 0
--           '0 3 * * *' = every day at 3:00 AM
-- -----------------------------------------------------------------------------

-- Create a job that runs process_embeddings every minute
-- SELECT cron.schedule('process-embeddings', '* * * * *', 'SELECT util.process_embeddings(5, 1);');

-- Create a job that runs reset_stuck_embeddings every minute
-- SELECT cron.schedule('reset-stuck-embeddings', '* * * * *', 'SELECT util.reset_stuck_embeddings(5);');

-- -----------------------------------------------------------------------------
-- EMBEDDING PROCESSING UTILITY FUNCTIONS (commented out)
-- Manual invocations of embedding processing utilities for testing or recovery.
--
-- process_embeddings(batch_size, max_requests):
--   Processes pending posts by generating vector embeddings via external API.
--   - batch_size: Number of posts to send per API call
--   - max_requests: Maximum number of API calls to make
--
-- reset_stuck_embeddings(threshold_minutes):
--   Resets embeddings that have been in 'processing' status for too long,
--   likely indicating a failed or hung job.
-- -----------------------------------------------------------------------------

-- Manual run of embedding processor (bypasses scheduling)
-- SELECT util.process_embeddings(1, 5);

-- Unsubscribe (remove) a scheduled job by its ID (26 in this example)
-- SELECT cron.unschedule(26);

-- Reset stuck embeddings that have been processing for more than 5 minutes
-- SELECT util.reset_stuck_embeddings(2);

-- Reset all embeddings with error status back to pending for retry
-- SELECT util.reset_error_embeddings();

-- Reset ALL embeddings to pending (full reprocessing)
-- SELECT util.reset_embedding_status();

-- -----------------------------------------------------------------------------
-- EMBEDDING STATUS AGGREGATION
-- Provides counts of posts by their current embedding processing status.
-- Useful for monitoring the overall health of the embedding pipeline.
-- -----------------------------------------------------------------------------

-- Count posts grouped by embedding status
-- SELECT COUNT(id), embedding_status FROM posts GROUP BY embedding_status;

-- View the dedicated embedding status summary table
-- SELECT * FROM post_embedding_status;

-- View detailed embedding processing logs
-- SELECT * FROM embedding_logs ORDER BY id DESC;

-- Count posts that have completed embeddings (non-null embeddings column)
-- SELECT COUNT(id) FROM posts WHERE embeddings IS NOT NULL;

-- -----------------------------------------------------------------------------
-- POSTGRESQL CONNECTION MONITORING
-- Check active PostgreSQL connections, filtering for pg_cron connections.
-- Useful for diagnosing connection pool issues or confirming cron activity.
-- -----------------------------------------------------------------------------

-- View PostgreSQL connection activity
-- SELECT * FROM pg_stat_activity WHERE application_name = 'pg_cron';
