"""Online serving: real-time recommendations.

The serving phase runs on each user request to quickly return personalized
recommendations. It assumes batch has already run and populated the vector DB
and user cache.

Serving is fast (milliseconds) and stateless: two calls with the same user
get the same recommendations (unless batch has run again in between).

Flow for a known user:
  1. Get user's embedding from trainer (or compute from ratings)
  2. Query vector DB for nearest items (fast with FAISS/Pinecone)
  3. Filter items user already rated
  4. Return top-k

Flow for a new user (cold-start):
  1. No embedding available
  2. Return popular items instead
  3. Optionally blend with content-based recommendations

Design:
  - Constructor takes the trained model and storage backends
  - recommend_for_user() handles known users
  - recommend_for_new_user() handles cold-start
  - Easy to test: inject mock components

This mirrors the Go version's feed.go structure but in Python.
"""

from typing import Dict, Protocol

from rec_sys.data.schema import MovieId, UserId, Vector
from rec_sys.model.cold_start import PopularityFallback
from rec_sys.model.embeddings import Embeddings
from rec_sys.model.trainer import ALSTrainer
from rec_sys.storage.user_cache import UserCache
from rec_sys.storage.vector_db import VectorDB


class Recommender:
    """Online serving engine for generating recommendations.

    Dependency injection: pass in trained model and storage backends.
    This makes serving testable and allows swapping backends without
    changing the serving logic.
    """

    def __init__(
        self,
        vector_db: VectorDB,
        user_cache: UserCache,
        trainer: ALSTrainer,
        popularity_scores: Dict[MovieId, float] | None = None,
    ):
        """Initialize the recommender.

        Args:
            vector_db: Pre-populated vector database with item embeddings.
            user_cache: Pre-populated user rating cache.
            trainer: Trained ALS model (used to get user embeddings).
            popularity_scores: Optional pre-computed popularity scores.
                              If None, will compute on-demand.
        """
        self.vector_db = vector_db
        self.user_cache = user_cache
        self.trainer = trainer
        self.popularity_scores = (
            popularity_scores or {}
        )  # Fallback to empty if not provided

    def recommend_for_user(
        self,
        user_id: UserId,
        n: int = 10,
        exclude_seen: bool = True,
    ) -> list[tuple[MovieId, float]]:
        """Generate recommendations for a known user.

        Args:
            user_id: The user ID (0-based remapped index).
            n: Number of recommendations to return.
            exclude_seen: If True, filter out items the user already rated.

        Returns:
            List of (movie_id, score) tuples, sorted by score descending.

        Raises:
            ValueError: If user_id is invalid or user embedding not available.

        Process:
          1. Get user's embedding (learned during batch training)
          2. Query vector DB for nearest items
          3. Filter already-rated items (if exclude_seen=True)
          4. Return top-n
        """
        # Get user's learned embedding.
        try:
            user_vector = self.trainer.get_user_vector(user_id)
        except ValueError as e:
            raise ValueError(f"User {user_id} not found: {e}") from e

        # Retrieve items user has already rated (to exclude them).
        seen_items = set()
        if exclude_seen:
            cached_ratings = self.user_cache.get_user_ratings(user_id)
            if cached_ratings:
                seen_items = {r.movie_id for r in cached_ratings}

        # Query nearest items from vector DB.
        # Request more than n to account for filtering.
        k_to_retrieve = n * 3  # Heuristic: fetch 3x to account for filtering
        nearest_ids = self.vector_db.query_nearest(user_vector, k=k_to_retrieve)

        # Build candidates with scores.
        candidates = [
            (item_id, user_vector.dot(self.trainer.get_item_vector(item_id)))
            for item_id in nearest_ids
        ]

        # Filter seen items.
        if exclude_seen:
            candidates = Embeddings.filter_seen_items(candidates, seen_items)

        # Return top n.
        return Embeddings.top_k(candidates, k=n)

    def recommend_for_new_user(
        self,
        n: int = 10,
    ) -> list[tuple[MovieId, float]]:
        """Generate recommendations for a new user (cold-start).

        When a user has no history, we fall back to popular items.
        In a more sophisticated system, you'd blend with content-based
        recommendations or use a contextual model (device, time, etc.).

        Args:
            n: Number of recommendations to return.

        Returns:
            List of (movie_id, score) tuples of popular items.
        """
        if not self.popularity_scores:
            # Compute popularity on-demand if not precomputed.
            # In production, this would be cached/precomputed.
            # For now, return empty (should not happen if batch ran).
            return []

        return PopularityFallback.top_k_popular(self.popularity_scores, k=n)

    def recommend_hybrid(
        self,
        user_id: UserId,
        n: int = 10,
        fallback_to_popularity: bool = True,
    ) -> list[tuple[MovieId, float]]:
        """Generate recommendations with fallback to cold-start.

        This is a robust method that handles both known and new users:
          - If user has history: recommend collaboratively
          - If user is new or collaborative fails: fall back to popularity

        Args:
            user_id: The user ID.
            n: Number of recommendations to return.
            fallback_to_popularity: If True, use popularity if user has no history.

        Returns:
            List of (movie_id, score) tuples.
        """
        try:
            # Try collaborative filtering first.
            return self.recommend_for_user(user_id, n=n, exclude_seen=True)
        except ValueError:
            # User not found or invalid. Fall back to popularity.
            if fallback_to_popularity:
                return self.recommend_for_new_user(n=n)
            else:
                # No fallback: raise the error.
                raise

    def get_similar_items(
        self,
        reference_item_id: MovieId,
        n: int = 10,
        exclude_ids: set[MovieId] | None = None,
    ) -> list[tuple[MovieId, float]]:
        """Find items similar to a reference item.

        This is useful for:
          - "Users who watched X also watched Y" (related items)
          - Exploring the item space
          - Content-based filtering fallback

        Args:
            reference_item_id: The item to find similar items for.
            n: Number of similar items to return.
            exclude_ids: Optional set of item IDs to exclude (e.g., the reference itself).

        Returns:
            List of (movie_id, score) tuples, sorted by similarity.

        Raises:
            ValueError: If reference item not found.
        """
        if exclude_ids is None:
            exclude_ids = set()

        # Add reference to exclusion set.
        exclude_ids = exclude_ids | {reference_item_id}

        # Get reference item's embedding.
        try:
            ref_vector = self.trainer.get_item_vector(reference_item_id)
        except ValueError as e:
            raise ValueError(f"Item {reference_item_id} not found: {e}") from e

        # Query nearest items.
        nearest_ids = self.vector_db.query_nearest(ref_vector, k=n + 1)

        # Build candidates with scores, exclude reference.
        candidates = [
            (item_id, ref_vector.dot(self.trainer.get_item_vector(item_id)))
            for item_id in nearest_ids
            if item_id not in exclude_ids
        ]

        return Embeddings.top_k(candidates, k=n)

    def set_popularity_scores(self, scores: Dict[MovieId, float]) -> None:
        """Update popularity scores (e.g., after batch completes).

        This allows dynamic updates without recreating the Recommender.
        """
        self.popularity_scores = scores
