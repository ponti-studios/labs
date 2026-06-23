"""
Domain types for the recommendation system.

These lightweight types define the core entities: users, movies, ratings, and
embedding vectors. They're shared across the entire system—notebooks, training,
serving—so they're at the top of the package hierarchy and imported everywhere.
"""

from dataclasses import dataclass
from typing import NewType

# User and movie IDs are integers in the MovieLens dataset, but we remap them to
# 0-based indices for matrix factorization (ALS requires dense integer indices).
# We keep the original IDs around in the loader's mapping so we can go back and
# forth between raw MovieLens IDs and our internal indices.
UserId = NewType("UserId", int)
MovieId = NewType("MovieId", int)


@dataclass(frozen=True)
class User:
    """A user in the system, identified by remapped ID."""

    id: UserId
    # Note: MovieLens has additional fields (age, gender, occupation, zip),
    # but we're keeping the schema minimal for this teaching system. A production
    # system might store user demographics or content preferences here.


@dataclass(frozen=True)
class Movie:
    """A movie (item) in the system, identified by remapped ID."""

    id: MovieId
    title: str
    # Note: MovieLens has genres (comedy, drama, etc.). We ignore them here
    # because we're doing pure collaborative filtering (user-user similarity
    # via shared ratings). A hybrid system might concatenate genres as features.
    # For now, the item embedding implicitly learns genre preferences.


@dataclass(frozen=True)
class Rating:
    """A single rating event from a user about a movie."""

    user_id: UserId
    movie_id: MovieId
    rating: float  # typically 1.0-5.0 (or 0.5, 1.5, etc. in MovieLens 1M)
    # Note: MovieLens also records the timestamp of each rating. We ignore it here,
    # but a production system might use timestamps for temporal decay or trend detection.


@dataclass(frozen=True)
class Vector:
    """An embedding vector from ALS factorization.

    These are latent factor representations learned by Alternating Least Squares.
    Both users and items get vectors of the same dimensionality. Similarity is
    computed as the dot product.
    """

    embedding: list[float]  # len == num_factors (typically 64)

    @property
    def dim(self) -> int:
        """Number of dimensions in this vector."""
        return len(self.embedding)

    def dot(self, other: "Vector") -> float:
        """Compute dot product with another vector (similarity score).

        Higher dot product = more similar. This is the core scoring operation
        used in both batch (finding top-N candidates) and serving (ranking).
        """
        if self.dim != other.dim:
            raise ValueError(
                f"Vector dimension mismatch: {self.dim} vs {other.dim}"
            )
        return sum(a * b for a, b in zip(self.embedding, other.embedding))

    def norm(self) -> float:
        """Euclidean norm (length) of this vector.

        Used for cosine similarity if you want to normalize scores.
        For dot-product scoring on factorized embeddings, we typically
        don't normalize because the learned factors capture magnitude too.
        """
        sum_sq: float = sum((x ** 2 for x in self.embedding), 0.0)
        return float(sum_sq ** 0.5)
