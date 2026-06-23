"""Tests for UserCache storage."""

from rec_sys.data.schema import MovieId, Rating, UserId
from rec_sys.storage.user_cache import InMemoryUserCache


class TestInMemoryUserCache:
    """Test the in-memory user rating cache."""

    def test_set_and_get_user_ratings(self) -> None:
        """Test storing and retrieving user ratings."""
        cache = InMemoryUserCache()
        ratings = [
            Rating(user_id=UserId(0), movie_id=MovieId(0), rating=5.0),
            Rating(user_id=UserId(0), movie_id=MovieId(1), rating=3.0),
        ]

        cache.set_user_ratings(UserId(0), ratings)
        retrieved = cache.get_user_ratings(UserId(0))

        assert retrieved is not None
        assert len(retrieved) == 2
        assert retrieved[0].movie_id == MovieId(0)
        assert retrieved[1].movie_id == MovieId(1)

    def test_get_nonexistent_user_returns_none(self) -> None:
        """Test that getting a non-existent user returns None."""
        cache = InMemoryUserCache()
        result = cache.get_user_ratings(UserId(999))
        assert result is None

    def test_set_overwrites_previous(self) -> None:
        """Test that setting ratings overwrites the previous value."""
        cache = InMemoryUserCache()
        ratings1 = [Rating(user_id=UserId(0), movie_id=MovieId(0), rating=5.0)]
        ratings2 = [Rating(user_id=UserId(0), movie_id=MovieId(1), rating=3.0)]

        cache.set_user_ratings(UserId(0), ratings1)
        cache.set_user_ratings(UserId(0), ratings2)

        retrieved = cache.get_user_ratings(UserId(0))
        assert len(retrieved) == 1
        assert retrieved[0].movie_id == MovieId(1)

    def test_get_user_rated_items(self) -> None:
        """Test getting the set of items a user has rated."""
        cache = InMemoryUserCache()
        ratings = [
            Rating(user_id=UserId(0), movie_id=MovieId(1), rating=5.0),
            Rating(user_id=UserId(0), movie_id=MovieId(3), rating=4.0),
        ]

        cache.set_user_ratings(UserId(0), ratings)
        rated_items = cache.get_user_rated_items(UserId(0))

        assert rated_items is not None
        assert rated_items == {MovieId(1), MovieId(3)}

    def test_get_user_rated_items_nonexistent_returns_none(self) -> None:
        """Test that getting rated items for non-existent user returns None."""
        cache = InMemoryUserCache()
        result = cache.get_user_rated_items(UserId(999))
        assert result is None

    def test_delete_user(self) -> None:
        """Test deleting a user's ratings."""
        cache = InMemoryUserCache()
        ratings = [Rating(user_id=UserId(0), movie_id=MovieId(0), rating=5.0)]

        cache.set_user_ratings(UserId(0), ratings)
        cache.delete_user(UserId(0))

        assert cache.get_user_ratings(UserId(0)) is None

    def test_delete_nonexistent_user_is_safe(self) -> None:
        """Test that deleting a non-existent user doesn't raise."""
        cache = InMemoryUserCache()
        # Should not raise.
        cache.delete_user(UserId(999))

    def test_clear(self) -> None:
        """Test clearing all cached data."""
        cache = InMemoryUserCache()
        cache.set_user_ratings(
            UserId(0),
            [Rating(user_id=UserId(0), movie_id=MovieId(0), rating=5.0)],
        )
        cache.set_user_ratings(
            UserId(1),
            [Rating(user_id=UserId(1), movie_id=MovieId(1), rating=4.0)],
        )

        cache.clear()

        assert cache.get_user_ratings(UserId(0)) is None
        assert cache.get_user_ratings(UserId(1)) is None
        assert cache.size() == 0

    def test_size(self) -> None:
        """Test the size convenience method."""
        cache = InMemoryUserCache()
        assert cache.size() == 0

        cache.set_user_ratings(
            UserId(0),
            [Rating(user_id=UserId(0), movie_id=MovieId(0), rating=5.0)],
        )
        assert cache.size() == 1

        cache.set_user_ratings(
            UserId(1),
            [Rating(user_id=UserId(1), movie_id=MovieId(1), rating=4.0)],
        )
        assert cache.size() == 2

        cache.delete_user(UserId(0))
        assert cache.size() == 1

    def test_multiple_users(self) -> None:
        """Test storing and retrieving ratings for multiple users."""
        cache = InMemoryUserCache()

        ratings_user_0 = [
            Rating(user_id=UserId(0), movie_id=MovieId(0), rating=5.0),
            Rating(user_id=UserId(0), movie_id=MovieId(1), rating=3.0),
        ]
        ratings_user_1 = [
            Rating(user_id=UserId(1), movie_id=MovieId(2), rating=4.0),
        ]

        cache.set_user_ratings(UserId(0), ratings_user_0)
        cache.set_user_ratings(UserId(1), ratings_user_1)

        # Verify each user's ratings are stored correctly.
        assert len(cache.get_user_ratings(UserId(0))) == 2
        assert len(cache.get_user_ratings(UserId(1))) == 1

        # Verify rated items are correct.
        assert cache.get_user_rated_items(UserId(0)) == {MovieId(0), MovieId(1)}
        assert cache.get_user_rated_items(UserId(1)) == {MovieId(2)}
