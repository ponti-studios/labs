"""User cache protocol and in-memory implementation.

A UserCache stores the rating history for each user. During serving, we need
to know which items a user has already rated so we can:
  1. Avoid recommending items they've already seen
  2. Compute their embedding (if needed)
  3. Build their user profile

The cache is populated during batch training and queried during online serving.

Production backends:
  - Redis: Fast in-memory cache with TTL and persistence
  - Memcached: Distributed caching
  - DuckDB: Local column store for batch analytics
  - PostgreSQL: Durable relational store

Here we provide the Protocol and a simple in-memory implementation.
"""

from typing import Dict, Protocol, Set

from rec_sys.data.schema import MovieId, Rating, UserId


class UserCache(Protocol):
    """Interface for storing and retrieving user rating history."""

    def set_user_ratings(self, user_id: UserId, ratings: list[Rating]) -> None:
        """Store or update a user's ratings.

        Args:
            user_id: The user ID.
            ratings: List of ratings for this user.
        """
        ...

    def get_user_ratings(self, user_id: UserId) -> list[Rating] | None:
        """Retrieve a user's ratings by ID.

        Args:
            user_id: The user ID.

        Returns:
            List of ratings for this user, or None if not found.
        """
        ...

    def get_user_rated_items(self, user_id: UserId) -> Set[MovieId] | None:
        """Get the set of items a user has rated.

        Convenience method: returns only the item IDs (not full ratings).
        Useful for filtering recommendations (don't recommend items already seen).

        Args:
            user_id: The user ID.

        Returns:
            Set of item IDs rated by this user, or None if user not found.
        """
        ...

    def delete_user(self, user_id: UserId) -> None:
        """Delete a user's ratings.

        Args:
            user_id: The user ID.
        """
        ...

    def clear(self) -> None:
        """Delete all cached data.

        Useful for testing and cleanup.
        """
        ...


class InMemoryUserCache:
    """Simple in-memory user rating cache.

    Stores user rating history in a Python dict. Suitable for demo, testing,
    and small datasets. For production (millions of users), use Redis or a
    relational database.

    No persistence: all data is lost on program exit.
    """

    def __init__(self) -> None:
        """Initialize an empty in-memory cache."""
        self._user_ratings: Dict[UserId, list[Rating]] = {}

    def set_user_ratings(self, user_id: UserId, ratings: list[Rating]) -> None:
        """Store or update a user's ratings."""
        self._user_ratings[user_id] = ratings

    def get_user_ratings(self, user_id: UserId) -> list[Rating] | None:
        """Retrieve a user's ratings by ID."""
        return self._user_ratings.get(user_id)

    def get_user_rated_items(self, user_id: UserId) -> Set[MovieId] | None:
        """Get the set of items a user has rated."""
        ratings = self._user_ratings.get(user_id)
        if ratings is None:
            return None
        return {r.movie_id for r in ratings}

    def delete_user(self, user_id: UserId) -> None:
        """Delete a user's ratings."""
        self._user_ratings.pop(user_id, None)

    def clear(self) -> None:
        """Delete all cached data."""
        self._user_ratings.clear()

    def size(self) -> int:
        """Return the number of users in the cache.

        Convenience method for testing/debugging.
        """
        return len(self._user_ratings)
