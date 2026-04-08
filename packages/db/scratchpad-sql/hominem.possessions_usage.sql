-- =============================================================================
-- File: hominem.possessions_usage.sql
-- Purpose: Calculate container weight including remaining contents (tare + substance)
-- Origin: Inventory management calculation for the hominem project
--         (possibly a substance tracking or prop inventory system)
-- Input: possession_containers table with JSONB description field
--        possessions_usage table with usage records
-- Output: Container name, tare weight, original amount, used amount, remaining, total weight
-- =============================================================================

-- -----------------------------------------------------------------------------
-- QUERY OVERVIEW
-- This query calculates the current weight of a container by combining:
--   1. Tare weight (weight of the empty container) stored in JSONB description
--   2. Remaining substance weight (original amount minus total usage)
--
-- The specific container being queried is identified by ILIKE '%glass%' in the name.
-- The substance being tracked is identified by a specific possession_id UUID.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- COMMON TABLE EXPRESSION (CTE): cocaine_calc
-- Calculates the total amount of substance used for a specific possession.
--
-- Calculation Logic:
--   - For 'pattern' type usage with date ranges: amount * number of days in range
--   - For all other usage types: just the amount as-is
--   - Sums all usage records for the given possession_id
--
-- The date range multiplication accounts for sustained usage over time, where
-- the amount represents a daily rate rather than a one-time use.
-- -----------------------------------------------------------------------------

WITH cocaine_calc AS (
  SELECT
    SUM(
      CASE
        -- Pattern usage with a defined date range: amount per day * number of days
        WHEN pu.type = 'pattern'
          AND pu.start_date IS NOT NULL
          AND pu.end_date IS NOT NULL
        THEN pu.amount * (pu.end_date - pu.start_date + 1)
        -- All other usage types: use the amount directly
        ELSE pu.amount
      END
    ) AS total_used_g
  FROM possessions_usage pu
  WHERE pu.possession_id = 'c8744876-2621-4828-900f-985777191ec6'
),

-- -----------------------------------------------------------------------------
-- COMMON TABLE EXPRESSION (CTE): original_amount
-- Defines the starting amount of substance in the container.
-- Hardcoded as 3.0 grams - this could alternatively be stored in the database.
-- -----------------------------------------------------------------------------

original_amount AS (
  SELECT 3.0 AS original_g
)

-- -----------------------------------------------------------------------------
-- MAIN QUERY: Calculate Container Weight Report
-- Joins the container record with the usage calculations to produce a
-- weight breakdown report.
--
-- Output Columns:
--   container_name      - Name of the container from possession_containers
--   tare_weight_g       - Empty container weight extracted from JSONB description
--   original_substance_g - Initial substance weight (from original_amount CTE)
--   total_used_g        - Calculated total usage (from cocaine_calc CTE)
--   remaining_substance_g - Original minus used (what's left in the container)
--   total_weight_g      - Tare + remaining (actual scale weight if weighed now)
-- -----------------------------------------------------------------------------

SELECT
  pc.name AS container_name,

  -- Extract tare_weight_g from JSONB description field
  -- The JSONB ->> operator gets a text value, then ::numeric converts to number
  ((pc.description::jsonb)->>'tare_weight_g')::numeric AS tare_weight_g,

  oa.original_g AS original_substance_g,
  cc.total_used_g,
  oa.original_g - COALESCE(cc.total_used_g, 0) AS remaining_substance_g,

  -- Total weight = container weight + remaining substance weight
  ((pc.description::jsonb)->>'tare_weight_g')::numeric
    + (oa.original_g - COALESCE(cc.total_used_g, 0)) AS total_weight_g

FROM possession_containers pc
CROSS JOIN original_amount oa
LEFT JOIN cocaine_calc cc ON true  -- Cross join ensures we always have original amount
WHERE pc.name ILIKE '%glass%';  -- Filter to glass containers
