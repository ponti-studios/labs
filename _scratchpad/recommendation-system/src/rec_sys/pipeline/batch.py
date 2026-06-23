"""Offline batch training job.

The batch phase runs periodically (e.g., nightly) to:
  1. Load fresh ratings from the database
  2. Train ALS model to learn user/item embeddings
  3. Store item vectors in the vector DB
  4. Cache user rating history for serving

After batch completes, the vector DB and user cache are ready for serving.
Batch is slow (minutes to hours) but can be run while serving continues
(old model serves requests, new model replaces it when ready).

Design:
  - Constructor takes injected dependencies (loader, trainer, stores)
  - run() orchestrates the full pipeline
  - Easy to test: inject mock components

This mirrors the Go version's batch.go structure but in Python.
"""

from typing import Protocol

from rec_sys.data.schema import MovieId, UserId
from rec_sys.model.cold_start import PopularityFallback
from rec_sys.model.trainer import ALSTrainer
from rec_sys.storage.user_cache import UserCache
from rec_sys.storage.vector_db import VectorDB


class DataLoader(Protocol):
    """Interface for loading rating data.

    Any data source (MovieLens, database, CSV) can be used as long as it
    provides load() and yields ratings/users/movies.
    """

    def load(self) -> None:
        """Load the data. Implementation-specific."""
        ...

    @property
    def num_users(self) -> int:
        """Total number of users."""
        ...

    @property
    def num_items(self) -> int:
        """Total number of items (movies)."""
        ...

    @property
    def ratings(self) -> list:
        """List of all ratings."""
        ...


class BatchJob:
    """Orchestrates the offline training pipeline.

    Dependency injection: pass in loader, trainer, and storage backends.
    This makes the job testable and reconfigurable without changing code.
    """

    def __init__(
        self,
        loader: DataLoader,
        trainer: ALSTrainer,
        vector_db: VectorDB,
        user_cache: UserCache,
    ):
        """Initialize the batch job with dependencies.

        Args:
            loader: Data loader (e.g., MovieLensLoader).
            trainer: ALS trainer instance.
            vector_db: Vector database for storing item embeddings.
            user_cache: Cache for storing user rating history.
        """
        self.loader = loader
        self.trainer = trainer
        self.vector_db = vector_db
        self.user_cache = user_cache

        # Statistics logged during/after batch.
        self.stats = {
            "users_loaded": 0,
            "movies_loaded": 0,
            "ratings_loaded": 0,
            "vectors_stored": 0,
            "users_cached": 0,
        }

    def run(self) -> None:
        """Execute the full batch pipeline.

        Steps:
          1. Load data
          2. Train ALS
          3. Populate vector DB with item vectors
          4. Populate user cache with rating history
          5. Compute and store popularity fallback for cold-start
        """
        print("Starting batch job...")

        # Step 1: Load data.
        print("  Loading data...")
        self.loader.load()
        self.stats["users_loaded"] = self.loader.num_users
        self.stats["movies_loaded"] = self.loader.num_items
        self.stats["ratings_loaded"] = len(self.loader.ratings)
        print(f"    Loaded {self.stats['users_loaded']} users, "
              f"{self.stats['movies_loaded']} movies, "
              f"{self.stats['ratings_loaded']} ratings")

        # Step 2: Train ALS model.
        print("  Training ALS model...")
        self.trainer.train(
            ratings=self.loader.ratings,
            num_users=self.loader.num_users,
            num_items=self.loader.num_items,
        )
        print("    Model trained successfully")

        # Step 3: Store item vectors in vector DB.
        print("  Storing item embeddings...")
        item_vectors = self.trainer.get_all_item_vectors()
        for movie_id, vector in item_vectors.items():
            self.vector_db.upsert(movie_id, vector)
        self.stats["vectors_stored"] = len(item_vectors)
        print(f"    Stored {self.stats['vectors_stored']} item vectors")

        # Step 4: Cache user rating history.
        print("  Caching user ratings...")
        for user_id in range(self.loader.num_users):
            uid = UserId(user_id)
            # Filter ratings for this user.
            user_ratings = [r for r in self.loader.ratings if r.user_id == uid]
            if user_ratings:
                self.user_cache.set_user_ratings(uid, user_ratings)
                self.stats["users_cached"] += 1
        print(f"    Cached ratings for {self.stats['users_cached']} users")

        # Step 5 (optional): Precompute popularity for cold-start.
        # This is optional - you could compute it on-demand during serving.
        print("  Computing popularity scores for cold-start...")
        popularity = PopularityFallback.compute_popularity(
            self.loader.ratings,
            weighting="count",
        )
        # Store popularity in a simple dict. In production, persist to cache.
        self.popularity_scores = popularity
        print(f"    Computed popularity for {len(popularity)} items")

        print("Batch job complete!")
        self._print_stats()

    def _print_stats(self) -> None:
        """Print summary statistics."""
        print("\nBatch Statistics:")
        for key, value in self.stats.items():
            print(f"  {key}: {value}")
