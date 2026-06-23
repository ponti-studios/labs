"""Alternating Least Squares (ALS) trainer for matrix factorization.

Matrix factorization is the core of this recommendation system. We decompose
the sparse user-item rating matrix into two dense factor matrices:
  - User factors: num_users × num_factors
  - Item factors: num_items × num_factors

A user's affinity for an item = dot product of their factor vectors.

ALS minimizes ||R - U * V^T||^2 + regularization, where:
  - R is the observed rating matrix (sparse, user-item)
  - U is the user factor matrix
  - V is the item factor matrix

It alternates between optimizing U (fixing V) and V (fixing U) until convergence.

This implementation wraps the `implicit` library, which provides a highly
optimized ALS solver using Conjugate Gradient and CVXOPT.

Reference:
  https://github.com/benfred/implicit
  https://www.youtube.com/watch?v=ZspR5PZToFc (ALS algorithm overview)
"""

from typing import Dict

import numpy as np
from implicit.als import AlternatingLeastSquares
from scipy import sparse

from rec_sys.data.schema import MovieId, Rating, UserId, Vector


class ALSTrainer:
    """Train user and item embeddings using Alternating Least Squares.

    The trainer takes a list of ratings, builds a user-item matrix, and
    factorizes it using ALS. After training, you can get embeddings for
    any user or item.

    Note: `implicit` is optimized for implicit feedback (binary: did/didn't
    interact). We adapt it for explicit ratings by using ratings as the
    interaction strength/weight. This is a common approach.
    """

    def __init__(self, factors: int = 64, iterations: int = 20, reg: float = 0.01):
        """Initialize the ALS trainer.

        Args:
            factors: Number of latent factors (embedding dimensionality).
                     Larger = more expressive but slower training and more overfitting risk.
                     64-128 is typical for recommendation systems.
            iterations: Number of ALS iterations. More = better fit but diminishing returns.
                       10-20 is usually sufficient for convergence.
            reg: L2 regularization parameter. Prevents overfitting by penalizing large factors.
                 Typical range: 0.001-0.1.
        """
        self.factors = factors
        self.iterations = iterations
        self.reg = reg

        # The actual ALS solver from the implicit library.
        # We use calculate_training_loss=False to skip computing loss each iteration
        # (it's slow and we don't need it for this teaching system).
        self.als = AlternatingLeastSquares(
            factors=factors,
            iterations=iterations,
            regularization=reg,
            calculate_training_loss=False,
        )

        # Trained factor matrices. Populated after calling train().
        # user_factors[i] = embedding for user with remapped ID i
        # item_factors[j] = embedding for item with remapped ID j
        self.user_factors: np.ndarray | None = None
        self.item_factors: np.ndarray | None = None

        # Metadata about the trained model.
        self.num_users: int = 0
        self.num_items: int = 0

    def train(
        self,
        ratings: list[Rating],
        num_users: int,
        num_items: int,
    ) -> None:
        """Train the ALS model on the given ratings.

        Args:
            ratings: List of (user_id, item_id, rating) tuples.
                    User and item IDs must be 0-based and contiguous (0..num_users-1, 0..num_items-1).
            num_users: Total number of users (to size the factor matrix).
            num_items: Total number of items (to size the factor matrix).

        This constructs a sparse user-item matrix, where entry (i, j) is the
        rating from user i for item j. The matrix is typically 99%+ sparse.
        Then it calls ALS to factorize it.
        """
        self.num_users = num_users
        self.num_items = num_items

        # Build the sparse rating matrix.
        # Format: row = user, column = item, value = rating.
        rows = [int(r.user_id) for r in ratings]
        cols = [int(r.movie_id) for r in ratings]
        data = [r.rating for r in ratings]

        # scipy.sparse.csr_matrix is efficient for matrix operations on sparse data.
        # (Coordinate format (coo) is efficient for construction; convert to CSR for training.)
        rating_matrix = sparse.coo_matrix(
            (data, (rows, cols)),
            shape=(num_users, num_items),
        ).tocsr()

        # Train ALS. This is the heavy computation—factorizes the matrix.
        # The implicit library requires the matrix to have integer values, but we pass
        # float ratings. The library treats them as "confidence weights" for the implicit
        # feedback model. This is a reasonable adaptation for explicit ratings.
        self.als.fit(rating_matrix, show_progress=False)

        # Extract the trained factor matrices from the ALS model.
        # user_factors.T because implicit stores them transposed.
        self.user_factors = np.array(self.als.user_factors, dtype=np.float32)
        self.item_factors = np.array(self.als.item_factors, dtype=np.float32)

    def get_user_vector(self, user_id: UserId) -> Vector:
        """Get the learned embedding for a user.

        Args:
            user_id: Remapped user ID (0-based index).

        Returns:
            A Vector object containing the user's latent factor vector.

        Raises:
            RuntimeError: If train() hasn't been called yet.
            ValueError: If user_id is out of range.
        """
        if self.user_factors is None:
            raise RuntimeError("Model not trained. Call train() first.")
        if not (0 <= int(user_id) < self.num_users):
            raise ValueError(
                f"User ID {user_id} out of range [0, {self.num_users})"
            )
        factors = self.user_factors[int(user_id)].tolist()
        return Vector(embedding=factors)

    def get_item_vector(self, item_id: MovieId) -> Vector:
        """Get the learned embedding for an item.

        Args:
            item_id: Remapped item ID (0-based index).

        Returns:
            A Vector object containing the item's latent factor vector.

        Raises:
            RuntimeError: If train() hasn't been called yet.
            ValueError: If item_id is out of range.
        """
        if self.item_factors is None:
            raise RuntimeError("Model not trained. Call train() first.")
        if not (0 <= int(item_id) < self.num_items):
            raise ValueError(
                f"Item ID {item_id} out of range [0, {self.num_items})"
            )
        factors = self.item_factors[int(item_id)].tolist()
        return Vector(embedding=factors)

    def get_all_user_vectors(self) -> Dict[UserId, Vector]:
        """Get embeddings for all users as a dict.

        Returns:
            Dict mapping UserId -> Vector.
        """
        if self.user_factors is None:
            raise RuntimeError("Model not trained. Call train() first.")
        return {
            UserId(i): Vector(embedding=self.user_factors[i].tolist())
            for i in range(self.num_users)
        }

    def get_all_item_vectors(self) -> Dict[MovieId, Vector]:
        """Get embeddings for all items as a dict.

        Returns:
            Dict mapping MovieId -> Vector.
        """
        if self.item_factors is None:
            raise RuntimeError("Model not trained. Call train() first.")
        return {
            MovieId(i): Vector(embedding=self.item_factors[i].tolist())
            for i in range(self.num_items)
        }
