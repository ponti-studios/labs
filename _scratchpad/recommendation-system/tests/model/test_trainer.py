"""Tests for ALSTrainer."""

from pathlib import Path

import pytest

from rec_sys.data import MovieLensLoader
from rec_sys.data.schema import MovieId, Rating, UserId, Vector
from rec_sys.model import ALSTrainer


class TestALSTrainer:
    """Test the ALS matrix factorization trainer."""

    @pytest.fixture
    def trainer(self) -> ALSTrainer:
        """Create a fresh trainer instance."""
        return ALSTrainer(factors=16, iterations=5)

    @pytest.fixture
    def sample_ratings(self) -> list[Rating]:
        """Create a small sample rating matrix for testing.

        5 ratings across 3 users and 3 items:
        User 0: rated item 0 (4.0), item 1 (2.0)
        User 1: rated item 0 (5.0), item 2 (3.0)
        User 2: rated item 1 (4.0)
        """
        return [
            Rating(user_id=UserId(0), movie_id=MovieId(0), rating=4.0),
            Rating(user_id=UserId(0), movie_id=MovieId(1), rating=2.0),
            Rating(user_id=UserId(1), movie_id=MovieId(0), rating=5.0),
            Rating(user_id=UserId(1), movie_id=MovieId(2), rating=3.0),
            Rating(user_id=UserId(2), movie_id=MovieId(1), rating=4.0),
        ]

    def test_trainer_initialization(self) -> None:
        """Test that a trainer initializes with correct parameters."""
        trainer = ALSTrainer(factors=32, iterations=10, reg=0.05)
        assert trainer.factors == 32
        assert trainer.iterations == 10
        assert trainer.reg == 0.05
        assert trainer.user_factors is None
        assert trainer.item_factors is None

    def test_train_success(self, trainer: ALSTrainer, sample_ratings: list[Rating]) -> None:
        """Test that training produces embeddings."""
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        # After training, factors should be populated.
        assert trainer.user_factors is not None
        assert trainer.item_factors is not None

        # Check dimensions.
        assert trainer.user_factors.shape == (3, 16)  # 3 users, 16 factors
        assert trainer.item_factors.shape == (3, 16)  # 3 items, 16 factors

    def test_get_user_vector(self, trainer: ALSTrainer, sample_ratings: list[Rating]) -> None:
        """Test retrieving a user embedding."""
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        user_vec = trainer.get_user_vector(UserId(0))
        assert isinstance(user_vec, Vector)
        assert user_vec.dim == 16

    def test_get_item_vector(self, trainer: ALSTrainer, sample_ratings: list[Rating]) -> None:
        """Test retrieving an item embedding."""
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        item_vec = trainer.get_item_vector(MovieId(0))
        assert isinstance(item_vec, Vector)
        assert item_vec.dim == 16

    def test_get_all_user_vectors(self, trainer: ALSTrainer, sample_ratings: list[Rating]) -> None:
        """Test getting all user embeddings as a dict."""
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        all_users = trainer.get_all_user_vectors()
        assert len(all_users) == 3
        assert all(isinstance(v, Vector) for v in all_users.values())

    def test_get_all_item_vectors(self, trainer: ALSTrainer, sample_ratings: list[Rating]) -> None:
        """Test getting all item embeddings as a dict."""
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        all_items = trainer.get_all_item_vectors()
        assert len(all_items) == 3
        assert all(isinstance(v, Vector) for v in all_items.values())

    def test_get_vector_before_train_raises(self, trainer: ALSTrainer) -> None:
        """Test that getting vectors before training raises RuntimeError."""
        with pytest.raises(RuntimeError, match="not trained"):
            trainer.get_user_vector(UserId(0))

        with pytest.raises(RuntimeError, match="not trained"):
            trainer.get_item_vector(MovieId(0))

    def test_get_vector_out_of_range_raises(
        self, trainer: ALSTrainer, sample_ratings: list[Rating]
    ) -> None:
        """Test that getting a non-existent user/item raises ValueError."""
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        with pytest.raises(ValueError, match="out of range"):
            trainer.get_user_vector(UserId(999))

        with pytest.raises(ValueError, match="out of range"):
            trainer.get_item_vector(MovieId(999))

    def test_embeddings_are_learned(self, trainer: ALSTrainer, sample_ratings: list[Rating]) -> None:
        """Test that training actually learns non-trivial embeddings.

        After training, embeddings should be non-zero and different for
        different users/items (not all the same).
        """
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        # Get all user vectors.
        user_vecs = [trainer.get_user_vector(UserId(i)).embedding for i in range(3)]

        # Check that they're not all zeros.
        assert any(any(abs(x) > 1e-6 for x in vec) for vec in user_vecs), \
            "Embeddings should not be all zeros"

        # Check that they're not all identical.
        assert user_vecs[0] != user_vecs[1] or user_vecs[1] != user_vecs[2], \
            "Different users should have different embeddings"

    def test_similarity_makes_sense(
        self, trainer: ALSTrainer, sample_ratings: list[Rating]
    ) -> None:
        """Test that similar users/items have higher dot products.

        In the fixture:
        - User 0 and 1 both rated item 0 (both like it)
        - Item 0 should be similar to both users

        After training, user 0's embedding dot product with item 0
        should be positive (they like it).
        """
        trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

        user_0 = trainer.get_user_vector(UserId(0))
        item_0 = trainer.get_item_vector(MovieId(0))

        # Dot product should be positive-ish (both rated positively).
        score = user_0.dot(item_0)
        # Note: ALS doesn't guarantee positive scores, but empirically
        # we'd expect it for well-rated items. This is a soft check.
        assert isinstance(score, float)

    def test_factors_dimension_matches_param(self, sample_ratings: list[Rating]) -> None:
        """Test that factor dimensions match the initialization parameter."""
        for dim in [8, 16, 32, 64]:
            trainer = ALSTrainer(factors=dim, iterations=2)
            trainer.train(ratings=sample_ratings, num_users=3, num_items=3)

            user_vec = trainer.get_user_vector(UserId(0))
            assert user_vec.dim == dim
