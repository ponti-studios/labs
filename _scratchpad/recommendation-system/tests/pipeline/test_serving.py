"""Tests for the online serving recommender."""

from rec_sys.data.schema import MovieId, Rating, UserId, Vector
from rec_sys.model.trainer import ALSTrainer
from rec_sys.pipeline.serving import Recommender
from rec_sys.storage.user_cache import InMemoryUserCache
from rec_sys.storage.vector_db import InMemoryVectorDB


class TestRecommender:
    """Test the online serving recommender."""

    def _setup_recommender(self) -> Recommender:
        """Create a recommender with trained model and populated stores."""
        # Create and train model.
        trainer = ALSTrainer(factors=8, iterations=2)
        ratings = [
            Rating(user_id=UserId(0), movie_id=MovieId(0), rating=5.0),
            Rating(user_id=UserId(0), movie_id=MovieId(1), rating=2.0),
            Rating(user_id=UserId(1), movie_id=MovieId(0), rating=4.0),
            Rating(user_id=UserId(1), movie_id=MovieId(2), rating=3.0),
            Rating(user_id=UserId(2), movie_id=MovieId(1), rating=4.0),
        ]
        trainer.train(ratings=ratings, num_users=3, num_items=3)

        # Populate vector DB.
        vector_db = InMemoryVectorDB()
        for item_id, vector in trainer.get_all_item_vectors().items():
            vector_db.upsert(item_id, vector)

        # Populate user cache.
        user_cache = InMemoryUserCache()
        for user_id in range(3):
            uid = UserId(user_id)
            user_ratings = [r for r in ratings if r.user_id == uid]
            if user_ratings:
                user_cache.set_user_ratings(uid, user_ratings)

        # Popularity scores.
        popularity = {
            MovieId(0): 2.0,
            MovieId(1): 2.0,
            MovieId(2): 1.0,
        }

        return Recommender(
            vector_db=vector_db,
            user_cache=user_cache,
            trainer=trainer,
            popularity_scores=popularity,
        )

    def test_recommend_for_user(self) -> None:
        """Test generating recommendations for a known user."""
        rec = self._setup_recommender()

        # Get recommendations for user 0.
        recommendations = rec.recommend_for_user(UserId(0), n=2)

        assert len(recommendations) <= 2
        assert all(isinstance(item_id, int) for item_id, _ in recommendations)
        assert all(isinstance(score, float) for _, score in recommendations)

    def test_recommend_excludes_seen_items(self) -> None:
        """Test that recommendations exclude already-rated items."""
        rec = self._setup_recommender()

        # User 0 rated items 0 and 1.
        # With exclude_seen=True, should not get 0 or 1.
        recommendations = rec.recommend_for_user(
            UserId(0),
            n=2,
            exclude_seen=True,
        )

        recommended_ids = {item_id for item_id, _ in recommendations}
        # User 0 has seen 0 and 1, so should only get 2 (or be empty if all seen).
        assert MovieId(0) not in recommended_ids
        assert MovieId(1) not in recommended_ids

    def test_recommend_includes_seen_with_exclude_false(self) -> None:
        """Test that setting exclude_seen=False includes all items."""
        rec = self._setup_recommender()

        recommendations = rec.recommend_for_user(
            UserId(0),
            n=3,
            exclude_seen=False,
        )

        # With exclude_seen=False, all items could be recommended.
        # We just check that the method runs without error.
        assert len(recommendations) <= 3

    def test_recommend_for_new_user(self) -> None:
        """Test cold-start recommendations for new users."""
        rec = self._setup_recommender()

        recommendations = rec.recommend_for_new_user(n=2)

        assert len(recommendations) <= 2
        # Should be popular items (movie 0 and 1 have count 2).
        assert recommendations[0][0] in [MovieId(0), MovieId(1)]

    def test_recommend_for_invalid_user_raises(self) -> None:
        """Test that recommending for invalid user raises ValueError."""
        rec = self._setup_recommender()

        try:
            rec.recommend_for_user(UserId(999), n=10)
            assert False, "Should have raised ValueError"
        except ValueError:
            pass

    def test_recommend_hybrid_known_user(self) -> None:
        """Test hybrid recommender for known users."""
        rec = self._setup_recommender()

        recommendations = rec.recommend_hybrid(UserId(0), n=2)

        assert len(recommendations) <= 2

    def test_recommend_hybrid_unknown_user_fallback(self) -> None:
        """Test that hybrid recommender falls back to popularity for unknown users."""
        rec = self._setup_recommender()

        recommendations = rec.recommend_hybrid(UserId(999), n=2)

        # Should not raise; should fall back to popularity.
        assert len(recommendations) <= 2

    def test_recommend_hybrid_no_fallback_raises(self) -> None:
        """Test that hybrid without fallback raises for unknown users."""
        rec = self._setup_recommender()

        try:
            rec.recommend_hybrid(UserId(999), n=2, fallback_to_popularity=False)
            assert False, "Should have raised ValueError"
        except ValueError:
            pass

    def test_get_similar_items(self) -> None:
        """Test finding similar items."""
        rec = self._setup_recommender()

        similar = rec.get_similar_items(MovieId(0), n=2)

        # Should not include the reference item itself.
        assert all(item_id != MovieId(0) for item_id, _ in similar)
        assert len(similar) <= 2

    def test_get_similar_items_invalid_raises(self) -> None:
        """Test that querying for non-existent item raises ValueError."""
        rec = self._setup_recommender()

        try:
            rec.get_similar_items(MovieId(999), n=2)
            assert False, "Should have raised ValueError"
        except ValueError:
            pass

    def test_set_popularity_scores(self) -> None:
        """Test updating popularity scores dynamically."""
        rec = self._setup_recommender()

        new_scores = {MovieId(0): 10.0, MovieId(1): 5.0, MovieId(2): 2.0}
        rec.set_popularity_scores(new_scores)

        # Verify cold-start uses new scores.
        recommendations = rec.recommend_for_new_user(n=1)
        # Top item should be 0 (score 10.0).
        assert recommendations[0][0] == MovieId(0)

    def test_recommend_returns_scores(self) -> None:
        """Test that recommendations include similarity scores."""
        rec = self._setup_recommender()

        recommendations = rec.recommend_for_user(UserId(0), n=5)

        if recommendations:
            # Verify scores are in descending order.
            scores = [score for _, score in recommendations]
            assert scores == sorted(scores, reverse=True)

    def test_recommend_respects_n(self) -> None:
        """Test that recommendations respect the n parameter."""
        rec = self._setup_recommender()

        for n in [1, 2, 5, 10]:
            recommendations = rec.recommend_for_user(UserId(0), n=n)
            assert len(recommendations) <= n
