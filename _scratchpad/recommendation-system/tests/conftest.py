"""Pytest configuration and shared fixtures."""

import tempfile
from pathlib import Path

import pytest


@pytest.fixture
def temp_movie_lens_data() -> Path:
    """Create a temporary MovieLens 1M-like dataset fixture.

    This fixture creates a minimal dataset with 3 users, 3 movies, and 5 ratings
    to test the loader without requiring the full 1M dataset download.

    Format:
      - users.dat: UserID::Gender::Age::Occupation::Zip
      - movies.dat: MovieID::Title::Genres
      - ratings.dat: UserID::MovieID::Rating::Timestamp
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        data_dir = Path(tmpdir)

        # Create users.dat with 3 users.
        # The loader only reads UserID, but we provide the full format for realism.
        users_content = """1::F::25::15::20105
2::M::45::0::19016
3::F::35::1::74201"""
        (data_dir / "users.dat").write_text(users_content)

        # Create movies.dat with 3 movies.
        # Format: MovieID::Title::Genres
        # The loader extracts title but ignores genres.
        movies_content = """1::Toy Story (1995)::Animation|Children's|Comedy
2::Jumanji (1995)::Adventure|Children's|Fantasy
3::Grumpier Old Men (1995)::Comedy|Romance"""
        (data_dir / "movies.dat").write_text(movies_content)

        # Create ratings.dat with 5 ratings.
        # Format: UserID::MovieID::Rating::Timestamp
        # Test with various rating values (1-5, including .5 increments).
        ratings_content = """1::1::5::978300760
1::2::3::978300700
2::1::4::978300000
2::3::2::978299700
3::2::4::978299600"""
        (data_dir / "ratings.dat").write_text(ratings_content)

        yield data_dir
