"""Tests for cold-start popularity-based recommendations."""

import pytest

from rec_sys.data.schema import MovieId, Rating, UserId
from rec_sys.model.cold_start import PopularityFallback


class TestPopularityFallback:
    """Test popularity-based cold-start recommendations."""

    @pytest.fixture
    def sample_ratings(self) -> list[Rating]:
        """Create sample ratings with varying popularity.

        Item 0: 3 ratings (average 4.0)
        Item 1: 2 ratings (average 4.5)
        Item 2: 1 rating (average 5.0)
        """
        return [
            # Item 0: 3 ratings
            Rating(user_id=UserId(0), movie_id=MovieId(0), rating=4.0),
            Rating(user_id=UserId(1), movie_id=MovieId(0), rating=4.0),
            Rating(user_id=UserId(2), movie_id=MovieId(0), rating=4.0),
            # Item 1: 2 ratings
            Rating(user_id=UserId(0), movie_id=MovieId(1), rating=4.0),
            Rating(user_id=UserId(1), movie_id=MovieId(1), rating=5.0),
            # Item 2: 1 rating
            Rating(user_id=UserId(0), movie_id=MovieId(2), rating=5.0),
        ]

    def test_compute_popularity_by_count(self, sample_ratings: list[Rating]) -> None:
        """Test popularity computation by rating count."""
        popularity = PopularityFallback.compute_popularity(
            sample_ratings,
            weighting="count",
        )

        # Item 0 has 3 ratings, item 1 has 2, item 2 has 1.
        assert popularity[MovieId(0)] == 3.0
        assert popularity[MovieId(1)] == 2.0
        assert popularity[MovieId(2)] == 1.0

    def test_compute_popularity_by_average(self, sample_ratings: list[Rating]) -> None:
        """Test popularity computation by average rating."""
        popularity = PopularityFallback.compute_popularity(
            sample_ratings,
            weighting="average",
        )

        # Item 0: avg 4.0
        # Item 1: avg 4.5
        # Item 2: avg 5.0
        assert abs(popularity[MovieId(0)] - 4.0) < 1e-6
        assert abs(popularity[MovieId(1)] - 4.5) < 1e-6
        assert abs(popularity[MovieId(2)] - 5.0) < 1e-6

    def test_compute_popularity_by_hybrid(self, sample_ratings: list[Rating]) -> None:
        """Test popularity computation by count * average."""
        popularity = PopularityFallback.compute_popularity(
            sample_ratings,
            weighting="hybrid",
        )

        # Item 0: 3 * 4.0 = 12.0
        # Item 1: 2 * 4.5 = 9.0
        # Item 2: 1 * 5.0 = 5.0
        assert abs(popularity[MovieId(0)] - 12.0) < 1e-6
        assert abs(popularity[MovieId(1)] - 9.0) < 1e-6
        assert abs(popularity[MovieId(2)] - 5.0) < 1e-6

    def test_compute_popularity_invalid_weighting(self, sample_ratings: list[Rating]) -> None:
        """Test that invalid weighting raises ValueError."""
        with pytest.raises(ValueError, match="Unknown weighting"):
            PopularityFallback.compute_popularity(
                sample_ratings,
                weighting="invalid",
            )

    def test_top_k_popular(self, sample_ratings: list[Rating]) -> None:
        """Test getting top-k popular items."""
        popularity = PopularityFallback.compute_popularity(
            sample_ratings,
            weighting="count",
        )

        top_2 = PopularityFallback.top_k_popular(popularity, k=2)

        assert len(top_2) == 2
        # Item 0 has highest count (3), so it should be first.
        assert top_2[0][0] == MovieId(0)
        assert top_2[0][1] == 3.0
        # Item 1 has next highest (2).
        assert top_2[1][0] == MovieId(1)
        assert top_2[1][1] == 2.0

    def test_top_k_popular_truncated(self, sample_ratings: list[Rating]) -> None:
        """Test that k limits the results."""
        popularity = PopularityFallback.compute_popularity(
            sample_ratings,
            weighting="count",
        )

        # Request 10, but only 3 items exist.
        top_10 = PopularityFallback.top_k_popular(popularity, k=10)
        assert len(top_10) == 3

    def test_blend_with_collaborative_equal_weight(self) -> None:
        """Test blending with equal weights (50-50)."""
        collab = [
            (MovieId(0), 0.8),
            (MovieId(1), 0.6),
        ]

        popular = [
            (MovieId(1), 0.9),
            (MovieId(2), 0.7),
        ]

        blended = PopularityFallback.blend_with_collaborative(
            collab,
            popular,
            collab_weight=0.5,
        )

        # Movie 0: 0.5 * 0.8 + 0.5 * 0 = 0.4
        # Movie 1: 0.5 * 0.6 + 0.5 * 0.9 = 0.75
        # Movie 2: 0.5 * 0 + 0.5 * 0.7 = 0.35
        # So order should be: 1, 0, 2

        assert blended[0][0] == MovieId(1)
        assert blended[1][0] == MovieId(0)
        assert blended[2][0] == MovieId(2)

    def test_blend_pure_collaborative(self) -> None:
        """Test blending with all weight on collaborative."""
        collab = [
            (MovieId(0), 0.8),
            (MovieId(1), 0.6),
        ]

        popular = [
            (MovieId(1), 0.9),
            (MovieId(2), 0.7),
        ]

        blended = PopularityFallback.blend_with_collaborative(
            collab,
            popular,
            collab_weight=1.0,
        )

        # Should be pure collaborative order: 0, 1.
        assert blended[0][0] == MovieId(0)
        assert blended[1][0] == MovieId(1)

    def test_blend_pure_popularity(self) -> None:
        """Test blending with all weight on popularity."""
        collab = [
            (MovieId(0), 0.8),
            (MovieId(1), 0.6),
        ]

        popular = [
            (MovieId(1), 0.9),
            (MovieId(2), 0.7),
        ]

        blended = PopularityFallback.blend_with_collaborative(
            collab,
            popular,
            collab_weight=0.0,
        )

        # Should be pure popularity order: 1, 2.
        assert blended[0][0] == MovieId(1)
        assert blended[1][0] == MovieId(2)

    def test_blend_invalid_weight_raises(self) -> None:
        """Test that invalid weights raise ValueError."""
        collab = [(MovieId(0), 0.5)]
        popular = [(MovieId(1), 0.5)]

        with pytest.raises(ValueError, match="collab_weight must be in"):
            PopularityFallback.blend_with_collaborative(
                collab,
                popular,
                collab_weight=-0.1,
            )

        with pytest.raises(ValueError, match="collab_weight must be in"):
            PopularityFallback.blend_with_collaborative(
                collab,
                popular,
                collab_weight=1.1,
            )
