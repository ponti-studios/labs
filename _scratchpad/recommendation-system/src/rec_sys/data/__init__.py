"""Data module: dataset loading and domain schema.

This module provides:
  - schema.py: User, Movie, Rating, Vector domain types
  - loader.py: MovieLensLoader for reading and remapping MovieLens 1M dataset
"""

from rec_sys.data.loader import MovieLensLoader
from rec_sys.data.schema import Movie, MovieId, Rating, User, UserId, Vector

__all__ = [
    "MovieLensLoader",
    "User",
    "Movie",
    "Rating",
    "Vector",
    "UserId",
    "MovieId",
]
