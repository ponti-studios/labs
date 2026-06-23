"""Embedding utilities: nearest neighbors, filtering, and ranking.

After training, we have user and item embeddings. This module provides
helper functions to:
  1. Find nearest items to a user (retrieval)
  2. Filter out items the user already rated (no redundant recommendations)
  3. Score and rank candidates (scoring/ranking)

The retrieval phase is compute-intensive (find top-k in high dimensions).
In production, you'd use a vector database (FAISS, Pinecone, Milvus).
Here we implement brute-force search for clarity.
"""

from typing import Dict, Set

from rec_sys.data.schema import MovieId, Rating, UserId, Vector


class Embeddings:
    """Utilities for working with learned embeddings.

    This is a stateless utility class—it doesn't store state, just provides
    common embedding operations. Think of it as a library of functions.
    """

    @staticmethod
    def nearest_items(
        user_vector: Vector,
        item_vectors: Dict[MovieId, Vector],
        k: int = 100,
        exclude_ids: Set[MovieId] | None = None,
    ) -> list[tuple[MovieId, float]]:
        """Find the k items most similar to a user's preferences.

        Args:
            user_vector: The user's embedding (their latent factor vector).
            item_vectors: Dict of all item embeddings.
            k: Number of nearest items to return.
            exclude_ids: Optional set of item IDs to skip (e.g., already rated).

        Returns:
            List of (item_id, similarity_score) tuples, sorted by similarity descending.
            Similarity is the dot product of embeddings.

        This is the core retrieval step: we compute similarity between the user
        and all items, then return the top-k. In production, this would use
        approximate nearest neighbor search (HNSW, LSH, etc.) for speed.
        Here we do brute-force for clarity.
        """
        if exclude_ids is None:
            exclude_ids = set()

        # Compute similarity (dot product) for all items.
        similarities: list[tuple[MovieId, float]] = []
        for item_id, item_vector in item_vectors.items():
            if item_id not in exclude_ids:
                score = user_vector.dot(item_vector)
                similarities.append((item_id, score))

        # Sort by score descending, return top k.
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:k]

    @staticmethod
    def get_user_rated_items(
        user_id: UserId,
        ratings: list[Rating],
    ) -> Set[MovieId]:
        """Get all items rated by a user.

        Used to filter out already-rated items from recommendations.
        A user shouldn't get a recommendation for something they've
        already watched and rated.
        """
        return {r.movie_id for r in ratings if r.user_id == user_id}

    @staticmethod
    def filter_seen_items(
        candidates: list[tuple[MovieId, float]],
        seen_item_ids: Set[MovieId],
    ) -> list[tuple[MovieId, float]]:
        """Filter out items the user has already seen.

        Args:
            candidates: List of (item_id, score) tuples.
            seen_item_ids: Set of item IDs to exclude.

        Returns:
            Filtered list with seen items removed.
        """
        return [(item_id, score) for item_id, score in candidates
                if item_id not in seen_item_ids]

    @staticmethod
    def top_k(
        candidates: list[tuple[MovieId, float]],
        k: int,
    ) -> list[tuple[MovieId, float]]:
        """Return the top k candidates by score.

        Simple helper to truncate a list. Useful after filtering or
        combining multiple candidate lists.
        """
        return candidates[:k]

    @staticmethod
    def score_items_by_similarity(
        candidates: list[tuple[MovieId, float]],
        item_vectors: Dict[MovieId, Vector],
        reference_vector: Vector,
    ) -> list[tuple[MovieId, float]]:
        """Re-rank candidates by similarity to a reference vector.

        This is useful if you have multiple recommendation strategies and
        want to blend them: compute candidates from each, then re-score
        them all by similarity to the user.

        Args:
            candidates: List of (item_id, score) tuples to re-rank.
            item_vectors: Dict of all item embeddings.
            reference_vector: Vector to measure similarity against (typically user vector).

        Returns:
            Re-scored list sorted by new similarity score.
        """
        rescored = []
        for item_id, _old_score in candidates:
            if item_id in item_vectors:
                new_score = reference_vector.dot(item_vectors[item_id])
                rescored.append((item_id, new_score))

        rescored.sort(key=lambda x: x[1], reverse=True)
        return rescored

    @staticmethod
    def apply_threshold(
        candidates: list[tuple[MovieId, float]],
        min_score: float,
    ) -> list[tuple[MovieId, float]]:
        """Filter candidates by a minimum similarity threshold.

        In some cases, you might not want recommendations below a certain
        confidence level. This helper filters them out.

        Args:
            candidates: List of (item_id, score) tuples.
            min_score: Minimum score to keep.

        Returns:
            Filtered list with scores below threshold removed.
        """
        return [(item_id, score) for item_id, score in candidates
                if score >= min_score]
