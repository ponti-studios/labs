"""Tests for MovieLensLoader and schema types."""

from pathlib import Path

import pytest

from rec_sys.data import MovieLensLoader
from rec_sys.data.schema import Movie, MovieId, Rating, User, UserId, Vector


class TestMovieLensLoader:
    """Test the MovieLensLoader with a fixture dataset."""

    def test_load_success(self, temp_movie_lens_data: Path) -> None:
        """Test that load() successfully reads all three files."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        # Verify we loaded the expected counts.
        assert len(loader.users) == 3, "Should have loaded 3 users"
        assert len(loader.movies) == 3, "Should have loaded 3 movies"
        assert len(loader.ratings) == 5, "Should have loaded 5 ratings"

    def test_user_id_remapping(self, temp_movie_lens_data: Path) -> None:
        """Test that user IDs are remapped to 0-based indices."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        # Fixture has MovieLens users 1, 2, 3. After remapping, they should be 0, 1, 2.
        assert loader.user_id_map[1] == 0, "MovieLens user 1 should remap to 0"
        assert loader.user_id_map[2] == 1, "MovieLens user 2 should remap to 1"
        assert loader.user_id_map[3] == 2, "MovieLens user 3 should remap to 2"

        # Test reverse mapping.
        assert loader.user_id_reverse[0] == 1, "Remapped user 0 should map back to MovieLens 1"
        assert loader.user_id_reverse[1] == 2, "Remapped user 1 should map back to MovieLens 2"
        assert loader.user_id_reverse[2] == 3, "Remapped user 2 should map back to MovieLens 3"

    def test_movie_id_remapping(self, temp_movie_lens_data: Path) -> None:
        """Test that movie IDs are remapped to 0-based indices."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        # Fixture has MovieLens movies 1, 2, 3. After remapping, they should be 0, 1, 2.
        assert loader.movie_id_map[1] == 0, "MovieLens movie 1 should remap to 0"
        assert loader.movie_id_map[2] == 1, "MovieLens movie 2 should remap to 1"
        assert loader.movie_id_map[3] == 2, "MovieLens movie 3 should remap to 2"

        # Test reverse mapping.
        assert (
            loader.movie_id_reverse[0] == 1
        ), "Remapped movie 0 should map back to MovieLens 1"
        assert (
            loader.movie_id_reverse[1] == 2
        ), "Remapped movie 1 should map back to MovieLens 2"
        assert (
            loader.movie_id_reverse[2] == 3
        ), "Remapped movie 2 should map back to MovieLens 3"

    def test_ratings_use_remapped_ids(self, temp_movie_lens_data: Path) -> None:
        """Test that ratings use remapped user and movie IDs."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        # All ratings should have 0-based remapped IDs.
        for rating in loader.ratings:
            assert rating.user_id in [
                UserId(0),
                UserId(1),
                UserId(2),
            ], "Rating should have a valid remapped user ID"
            assert rating.movie_id in [
                MovieId(0),
                MovieId(1),
                MovieId(2),
            ], "Rating should have a valid remapped movie ID"

    def test_stats_computation(self, temp_movie_lens_data: Path) -> None:
        """Test that stats() computes correct dataset statistics."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        stats = loader.stats()

        assert stats["num_users"] == 3, "Should have 3 users"
        assert stats["num_movies"] == 3, "Should have 3 movies"
        assert stats["num_ratings"] == 5, "Should have 5 ratings"
        assert (
            stats["max_possible_ratings"] == 9
        ), "Max possible is 3 users * 3 movies = 9"

        # Sparsity: 5 out of 9 possible = 44.4% filled, 55.6% sparse.
        expected_sparsity = 100.0 * (1 - 5 / 9)
        assert abs(stats["sparsity_percent"] - expected_sparsity) < 0.01

        # Average ratings per user: 5 ratings / 3 users ≈ 1.67.
        assert abs(stats["avg_ratings_per_user"] - 5 / 3) < 0.01

        # Average ratings per movie: 5 ratings / 3 movies ≈ 1.67.
        assert abs(stats["avg_ratings_per_movie"] - 5 / 3) < 0.01

        # Rating distribution: fixture has ratings [5, 3, 4, 2, 4].
        assert stats["min_rating"] == 2.0
        assert stats["max_rating"] == 5.0
        assert abs(stats["avg_rating"] - (5 + 3 + 4 + 2 + 4) / 5) < 0.01

    def test_remapped_id_conversion(self, temp_movie_lens_data: Path) -> None:
        """Test conversion methods between MovieLens and remapped IDs."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        # Test user ID conversion.
        remapped_uid = loader.remapped_user_id(1)
        assert remapped_uid == UserId(0)
        original_uid = loader.original_user_id(0)
        assert original_uid == 1

        # Test movie ID conversion.
        remapped_mid = loader.remapped_movie_id(2)
        assert remapped_mid == MovieId(1)
        original_mid = loader.original_movie_id(1)
        assert original_mid == 2

    def test_get_user(self, temp_movie_lens_data: Path) -> None:
        """Test retrieving a user by remapped ID."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        user = loader.get_user(UserId(0))
        assert user.id == UserId(0)
        assert isinstance(user, User)

    def test_get_movie(self, temp_movie_lens_data: Path) -> None:
        """Test retrieving a movie by remapped ID."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        movie = loader.get_movie(MovieId(0))
        assert movie.id == MovieId(0)
        assert movie.title == "Toy Story (1995)"
        assert isinstance(movie, Movie)

    def test_missing_file_raises_error(self, tmp_path: Path) -> None:
        """Test that loading from a directory with missing files raises."""
        # Create a directory with no files.
        loader = MovieLensLoader(tmp_path)

        with pytest.raises(FileNotFoundError, match="users.dat"):
            loader.load()

    def test_invalid_id_conversion_raises_error(
        self, temp_movie_lens_data: Path
    ) -> None:
        """Test that converting an unknown ID raises ValueError."""
        loader = MovieLensLoader(temp_movie_lens_data)
        loader.load()

        # Try to convert a MovieLens ID that doesn't exist in the fixture.
        with pytest.raises(ValueError, match="Unknown MovieLens user ID"):
            loader.remapped_user_id(999)


class TestVector:
    """Test the Vector embedding type."""

    def test_vector_creation(self) -> None:
        """Test creating a vector."""
        embedding = [0.1, 0.2, 0.3]
        vec = Vector(embedding=embedding)
        assert vec.embedding == embedding

    def test_vector_dim(self) -> None:
        """Test the dim property."""
        vec = Vector(embedding=[1.0, 2.0, 3.0, 4.0])
        assert vec.dim == 4

    def test_vector_dot_product(self) -> None:
        """Test dot product computation."""
        v1 = Vector(embedding=[1.0, 2.0, 3.0])
        v2 = Vector(embedding=[4.0, 5.0, 6.0])

        # Dot product: 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        expected = 32.0
        assert abs(v1.dot(v2) - expected) < 1e-6

    def test_vector_dot_product_dimension_mismatch(self) -> None:
        """Test that dot product fails with mismatched dimensions."""
        v1 = Vector(embedding=[1.0, 2.0])
        v2 = Vector(embedding=[1.0, 2.0, 3.0])

        with pytest.raises(ValueError, match="Vector dimension mismatch"):
            v1.dot(v2)

    def test_vector_norm(self) -> None:
        """Test Euclidean norm computation."""
        # Vector [3, 4] has norm 5 (since 3^2 + 4^2 = 25, sqrt(25) = 5).
        vec = Vector(embedding=[3.0, 4.0])
        expected_norm = 5.0
        assert abs(vec.norm() - expected_norm) < 1e-6

    def test_vector_orthogonal_dot_product(self) -> None:
        """Test that orthogonal vectors have zero dot product."""
        # [1, 0] and [0, 1] are orthogonal.
        v1 = Vector(embedding=[1.0, 0.0])
        v2 = Vector(embedding=[0.0, 1.0])
        assert abs(v1.dot(v2)) < 1e-6
