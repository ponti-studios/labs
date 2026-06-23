"""Cold-start recommendations for new users without history.

The cold-start problem: A brand-new user has no ratings, so collaborative
filtering can't recommend anything (we can't compute similarity to anyone else).

Solutions:
  1. Popularity-based: Recommend what everyone likes (simple baseline)
  2. Content-based: Use item metadata (genres, director, etc.)
  3. Hybrid: Blend both signals
  4. Contextual: Use session context (time, device, location)

Here we implement popularity-based as a baseline. It's effective for new users
and serves as a good fallback when collaborative filtering is uncertain.

In production, you'd blend this with content-based features for better
cold-start performance.
"""

from collections import Counter
from typing import Dict

from rec_sys.data.schema import MovieId, Rating


class PopularityFallback:
    """Recommend popular items to new users without history.

    Popularity is measured by the number of ratings, average rating, or both.
    This is a stateless utility: you compute popularity once, then use it
    whenever you need cold-start recommendations.
    """

    @staticmethod
    def compute_popularity(
        ratings: list[Rating],
        weighting: str = "count",
    ) -> Dict[MovieId, float]:
        """Compute popularity scores for all items.

        Args:
            ratings: All ratings in the system.
            weighting: How to measure popularity:
                - "count": Number of ratings (default, simple count)
                - "average": Average rating (only highly-rated items)
                - "hybrid": Count * average rating (balances breadth and quality)

        Returns:
            Dict mapping item ID -> popularity score.

        Notes:
            - "count" is robust to outliers (one 5-star doesn't dominate)
            - "average" is biased toward items with few ratings (high variance)
            - "hybrid" balances both: popular AND well-liked

        For this system, "count" is recommended. Popular items have been
        rated many times, so we have confidence in the signal.
        """
        # Count ratings and sum ratings per item.
        rating_counts: Counter[MovieId] = Counter()
        rating_sums: Dict[MovieId, float] = {}

        for rating in ratings:
            rating_counts[rating.movie_id] += 1
            rating_sums[rating.movie_id] = (
                rating_sums.get(rating.movie_id, 0.0) + rating.rating
            )

        # Compute popularity based on weighting strategy.
        popularity: Dict[MovieId, float] = {}

        if weighting == "count":
            # Number of ratings (higher = more popular).
            for item_id, count in rating_counts.items():
                popularity[item_id] = float(count)

        elif weighting == "average":
            # Average rating (higher = higher quality).
            for item_id, total in rating_sums.items():
                count = rating_counts[item_id]
                avg = total / count
                popularity[item_id] = avg

        elif weighting == "hybrid":
            # Count * average: popular AND well-liked.
            for item_id, total in rating_sums.items():
                count = rating_counts[item_id]
                avg = total / count
                popularity[item_id] = float(count) * avg

        else:
            raise ValueError(
                f"Unknown weighting strategy: {weighting}. "
                "Choose from: count, average, hybrid"
            )

        return popularity

    @staticmethod
    def top_k_popular(
        popularity_scores: Dict[MovieId, float],
        k: int,
    ) -> list[tuple[MovieId, float]]:
        """Get the top k most popular items.

        Args:
            popularity_scores: Dict of item ID -> popularity score.
            k: Number of items to return.

        Returns:
            List of (item_id, score) tuples sorted by popularity descending.

        This is your fallback recommendation: when you have no user history,
        just return these top-k items. They're likely to be broadly appealing.
        """
        sorted_items = sorted(
            popularity_scores.items(),
            key=lambda x: x[1],
            reverse=True,
        )
        return sorted_items[:k]

    @staticmethod
    def blend_with_collaborative(
        collab_candidates: list[tuple[MovieId, float]],
        popular_candidates: list[tuple[MovieId, float]],
        collab_weight: float = 0.7,
    ) -> list[tuple[MovieId, float]]:
        """Blend collaborative and popularity-based recommendations.

        When you have weak collaborative signals (e.g., new user with just 1 rating),
        you might want to blend in popular items to improve diversity.

        Args:
            collab_candidates: List of (item_id, score) from collaborative filtering.
            popular_candidates: List of (item_id, score) from popularity.
            collab_weight: Weight for collaborative (0-1). Popularity gets (1 - weight).

        Returns:
            Blended list, sorted by combined score.

        Example:
            - collab_weight=0.7 means 70% collaborative, 30% popularity.
            - Use 0.5 for half-and-half (good for new users).
            - Use 1.0 for pure collaborative (don't rely on popularity).
        """
        if not (0 <= collab_weight <= 1):
            raise ValueError("collab_weight must be in [0, 1]")

        # Index both lists for fast lookup.
        collab_dict = dict(collab_candidates)
        popular_dict = dict(popular_candidates)

        # Combine scores. Items in both lists get both scores;
        # items in only one list get only that score (zero for the other).
        all_items = set(collab_dict.keys()) | set(popular_dict.keys())
        blended = {}

        for item_id in all_items:
            collab_score = collab_dict.get(item_id, 0.0)
            popular_score = popular_dict.get(item_id, 0.0)
            blended[item_id] = (
                collab_weight * collab_score
                + (1 - collab_weight) * popular_score
            )

        # Sort and return.
        sorted_items = sorted(
            blended.items(),
            key=lambda x: x[1],
            reverse=True,
        )
        return sorted_items
