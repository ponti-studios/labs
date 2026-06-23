"""Model module: training and embedding utilities.

This module provides:
  - trainer.py: ALSTrainer wrapping implicit.als for matrix factorization
  - embeddings.py: Vector utilities (similarity, nearest neighbors, filtering)
  - cold_start.py: PopularityFallback for new users without history
"""

from rec_sys.model.cold_start import PopularityFallback
from rec_sys.model.embeddings import Embeddings
from rec_sys.model.trainer import ALSTrainer

__all__ = [
    "ALSTrainer",
    "Embeddings",
    "PopularityFallback",
]
