"""Persistence layer for saving/loading trained models and stores.

The batch phase trains the model and populates the stores (vector DB, user cache).
These are saved to disk so the serving phase can load and reuse them without
re-training.

Uses pickle for serialization (simple, works for our in-memory stores).
For production (FAISS, Redis), you'd have backend-specific save/load logic.
"""

import pickle
from pathlib import Path
from typing import Any

from rec_sys.model.trainer import ALSTrainer
from rec_sys.storage.user_cache import InMemoryUserCache
from rec_sys.storage.vector_db import InMemoryVectorDB


DEFAULT_STATE_DIR = Path.home() / ".rec-sys"


def ensure_state_dir(state_dir: Path = DEFAULT_STATE_DIR) -> Path:
    """Ensure the state directory exists."""
    state_dir.mkdir(parents=True, exist_ok=True)
    return state_dir


def save_state(
    trainer: ALSTrainer,
    vector_db: InMemoryVectorDB,
    user_cache: InMemoryUserCache,
    popularity_scores: dict[Any, float],
    state_dir: Path = DEFAULT_STATE_DIR,
) -> None:
    """Save trained model and stores to disk.

    Creates:
      ~/.rec-sys/trainer.pkl
      ~/.rec-sys/vector_db.pkl
      ~/.rec-sys/user_cache.pkl
      ~/.rec-sys/popularity.pkl
    """
    state_dir = ensure_state_dir(state_dir)

    # Save trainer.
    with open(state_dir / "trainer.pkl", "wb") as f:
        pickle.dump(trainer, f)

    # Save vector DB.
    with open(state_dir / "vector_db.pkl", "wb") as f:
        pickle.dump(vector_db, f)

    # Save user cache.
    with open(state_dir / "user_cache.pkl", "wb") as f:
        pickle.dump(user_cache, f)

    # Save popularity scores.
    with open(state_dir / "popularity.pkl", "wb") as f:
        pickle.dump(popularity_scores, f)

    print(f"State saved to {state_dir}")


def load_state(
    state_dir: Path = DEFAULT_STATE_DIR,
) -> tuple[ALSTrainer, InMemoryVectorDB, InMemoryUserCache, dict[Any, float]]:
    """Load trained model and stores from disk.

    Raises FileNotFoundError if any required file is missing.
    """
    state_dir = Path(state_dir)

    trainer_path = state_dir / "trainer.pkl"
    vector_db_path = state_dir / "vector_db.pkl"
    user_cache_path = state_dir / "user_cache.pkl"
    popularity_path = state_dir / "popularity.pkl"

    if not trainer_path.exists():
        raise FileNotFoundError(
            f"Trained model not found at {trainer_path}. "
            "Run `rec-sys batch` first."
        )

    with open(trainer_path, "rb") as f:
        trainer = pickle.load(f)

    with open(vector_db_path, "rb") as f:
        vector_db = pickle.load(f)

    with open(user_cache_path, "rb") as f:
        user_cache = pickle.load(f)

    with open(popularity_path, "rb") as f:
        popularity_scores = pickle.load(f)

    return trainer, vector_db, user_cache, popularity_scores


def clear_state(state_dir: Path = DEFAULT_STATE_DIR) -> None:
    """Delete all saved state."""
    state_dir = Path(state_dir)
    for f in ["trainer.pkl", "vector_db.pkl", "user_cache.pkl", "popularity.pkl"]:
        (state_dir / f).unlink(missing_ok=True)
    print(f"State cleared from {state_dir}")
