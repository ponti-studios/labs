"""Storage module: protocols and in-memory implementations.

This module defines the storage interfaces:
  - VectorDB: Store and retrieve item embeddings
  - UserCache: Store and retrieve user rating history

Protocols allow clean separation between the pipeline logic (which doesn't
care how vectors are stored) and the storage backend (which can be swapped
for FAISS, Redis, Pinecone, etc. in production).

For now, in-memory implementations are provided for testing and demo use.
"""

from rec_sys.storage.user_cache import InMemoryUserCache, UserCache
from rec_sys.storage.vector_db import InMemoryVectorDB, VectorDB

__all__ = [
    "VectorDB",
    "InMemoryVectorDB",
    "UserCache",
    "InMemoryUserCache",
]
