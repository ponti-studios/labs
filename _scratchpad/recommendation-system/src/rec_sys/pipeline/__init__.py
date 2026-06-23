"""Pipeline module: batch training and online serving.

This module wires together the full recommendation workflow:

  - BatchJob: Offline phase (runs periodically, e.g., daily)
    1. Load ratings from MovieLens
    2. Train ALS model
    3. Generate and store embeddings
    4. Build user rating cache

  - Recommender: Online phase (runs on each request)
    1. Get user's embedding (or use fallback for new users)
    2. Query nearest items from vector DB
    3. Filter already-rated items
    4. Return top-k recommendations

Together, they implement the full two-phase architecture:
  - Batch (slow, accurate) → precomputes everything
  - Serving (fast, real-time) → just does lookups and filtering
"""

from rec_sys.pipeline.batch import BatchJob
from rec_sys.pipeline.serving import Recommender

__all__ = [
    "BatchJob",
    "Recommender",
]
