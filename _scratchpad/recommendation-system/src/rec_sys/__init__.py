"""
rec-sys: Unified recommendation system package.

Combines the learning path (notebooks) and production architecture (pipeline)
into one importable Python package. The data/ module handles MovieLens parsing.
The model/ module trains embeddings. The storage/ and pipeline/ modules handle
the full batch-then-serve workflow.
"""

__version__ = "0.1.0"

from rec_sys.data.schema import Movie, Rating, User, Vector

__all__ = [
    "User",
    "Movie",
    "Rating",
    "Vector",
]
