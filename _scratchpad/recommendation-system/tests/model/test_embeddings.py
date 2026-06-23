"""Tests for the Embeddings utility class."""

from rec_sys.data.schema import MovieId, Rating, UserId, Vector
from rec_sys.model.embeddings import Embeddings


class TestEmbeddings:
    """Test embedding utilities for retrieval and filtering."""

    def test_nearest_items(self) -> None:
        """Test finding the k nearest items to a user."""
        user_vec = Vector(embedding=[1.0, 0.0])  # Points right

        # Three items at different angles.
        item_vecs = {
            MovieId(0): Vector(embedding=[1.0, 0.0]),  # Same direction, score = 1
            MovieId(1): Vector(embedding=[0.0, 1.0]),  # Orthogonal, score = 0
            MovieId(2): Vector(embedding=[-1.0, 0.0]),  # Opposite, score = -1
        }

        # Find top-2 nearest.
        nearest = Embeddings.nearest_items(user_vec, item_vecs, k=2)

        assert len(nearest) == 2
        assert nearest[0][0] == MovieId(0)  # Highest similarity
        assert nearest[1][0] == MovieId(1)  # Middle similarity

    def test_nearest_items_with_exclusions(self) -> None:
        """Test that excluded items are filtered out."""
        user_vec = Vector(embedding=[1.0, 0.0])

        item_vecs = {
            MovieId(0): Vector(embedding=[1.0, 0.0]),
            MovieId(1): Vector(embedding=[0.0, 1.0]),
            MovieId(2): Vector(embedding=[0.5, 0.0]),
        }

        # Exclude the best item.
        nearest = Embeddings.nearest_items(
            user_vec,
            item_vecs,
            k=2,
            exclude_ids={MovieId(0)},
        )

        assert len(nearest) == 2
        assert MovieId(0) not in [iid for iid, _ in nearest]
        assert nearest[0][0] == MovieId(2)  # Second-best

    def test_nearest_items_respects_k(self) -> None:
        """Test that at most k items are returned."""
        user_vec = Vector(embedding=[1.0, 0.0])

        item_vecs = {
            MovieId(i): Vector(embedding=[1.0 - 0.1 * i, 0.0])
            for i in range(10)
        }

        for k in [1, 3, 5, 10, 100]:
            nearest = Embeddings.nearest_items(user_vec, item_vecs, k=k)
            assert len(nearest) <= k

    def test_get_user_rated_items(self) -> None:
        """Test extracting items rated by a user."""
        ratings = [
            Rating(user_id=UserId(0), movie_id=MovieId(1), rating=5.0),
            Rating(user_id=UserId(0), movie_id=MovieId(3), rating=4.0),
            Rating(user_id=UserId(1), movie_id=MovieId(1), rating=3.0),
        ]

        rated_by_user_0 = Embeddings.get_user_rated_items(UserId(0), ratings)
        assert rated_by_user_0 == {MovieId(1), MovieId(3)}

        rated_by_user_1 = Embeddings.get_user_rated_items(UserId(1), ratings)
        assert rated_by_user_1 == {MovieId(1)}

    def test_filter_seen_items(self) -> None:
        """Test filtering out already-seen items."""
        candidates = [
            (MovieId(0), 0.9),
            (MovieId(1), 0.8),
            (MovieId(2), 0.7),
            (MovieId(3), 0.6),
        ]

        seen = {MovieId(1), MovieId(3)}
        filtered = Embeddings.filter_seen_items(candidates, seen)

        assert len(filtered) == 2
        assert filtered[0][0] == MovieId(0)
        assert filtered[1][0] == MovieId(2)

    def test_top_k(self) -> None:
        """Test truncating a candidate list."""
        candidates = [
            (MovieId(0), 0.9),
            (MovieId(1), 0.8),
            (MovieId(2), 0.7),
        ]

        top_2 = Embeddings.top_k(candidates, k=2)
        assert len(top_2) == 2
        assert top_2 == [(MovieId(0), 0.9), (MovieId(1), 0.8)]

    def test_score_items_by_similarity(self) -> None:
        """Test re-scoring candidates by similarity to a reference."""
        candidates = [
            (MovieId(0), 0.5),  # Old score (ignored)
            (MovieId(1), 0.3),
        ]

        item_vecs = {
            MovieId(0): Vector(embedding=[1.0, 0.0]),
            MovieId(1): Vector(embedding=[0.0, 1.0]),
        }

        # Reference vector points right.
        ref_vec = Vector(embedding=[1.0, 0.0])

        rescored = Embeddings.score_items_by_similarity(candidates, item_vecs, ref_vec)

        # After rescoring, item 0 should be first (dot=1.0) and item 1 second (dot=0.0).
        assert rescored[0][0] == MovieId(0)
        assert rescored[0][1] == 1.0
        assert rescored[1][0] == MovieId(1)
        assert rescored[1][1] == 0.0

    def test_apply_threshold(self) -> None:
        """Test filtering candidates by score threshold."""
        candidates = [
            (MovieId(0), 0.9),
            (MovieId(1), 0.5),
            (MovieId(2), 0.3),
        ]

        # Keep only items with score >= 0.5.
        above_threshold = Embeddings.apply_threshold(candidates, min_score=0.5)

        assert len(above_threshold) == 2
        assert above_threshold[0][0] == MovieId(0)
        assert above_threshold[1][0] == MovieId(1)

    def test_apply_threshold_zero(self) -> None:
        """Test threshold with negative scores."""
        candidates = [
            (MovieId(0), 0.5),
            (MovieId(1), -0.1),
            (MovieId(2), -0.5),
        ]

        # Keep only non-negative scores.
        non_negative = Embeddings.apply_threshold(candidates, min_score=0.0)

        assert len(non_negative) == 1
        assert non_negative[0][0] == MovieId(0)
