"""Vector database protocol and in-memory implementation.

A VectorDB stores and retrieves item embeddings. After ALS training, we
persist all item vectors so they can be queried at serving time without
re-training.

Production backends:
  - FAISS: Facebook's library for approximate nearest neighbor search
  - Pinecone: Managed vector database
  - Milvus: Open-source vector DB
  - Redis with RedisSearch: Fast in-memory vectors with indexing

Here we provide the Protocol (interface) and a simple in-memory implementation.
New backends can be added by implementing the Protocol.
"""

from typing import Dict, Protocol

from rec_sys.data.schema import MovieId, Vector


class VectorDB(Protocol):
    """Interface for storing and retrieving item embeddings.

    This is a Protocol (structural subtyping), not a base class. Any class
    implementing these methods can be used as a VectorDB. This is Python's
    equivalent to Go interfaces and makes testing/mocking very clean.
    """

    def upsert(self, item_id: MovieId, vector: Vector) -> None:
        """Store or update an item's embedding.

        Args:
            item_id: The item ID (0-based remapped index).
            vector: The embedding vector.
        """
        ...

    def get(self, item_id: MovieId) -> Vector | None:
        """Retrieve an item's embedding by ID.

        Args:
            item_id: The item ID.

        Returns:
            The embedding vector, or None if not found.
        """
        ...

    def delete(self, item_id: MovieId) -> None:
        """Delete an item's embedding.

        Args:
            item_id: The item ID.
        """
        ...

    def all_ids(self) -> list[MovieId]:
        """Get all stored item IDs.

        Returns:
            List of all item IDs in the database.
        """
        ...

    def query_nearest(self, vector: Vector, k: int = 100) -> list[MovieId]:
        """Find the k nearest items to a query vector.

        This is the core retrieval operation: given a user's embedding,
        find the most similar items.

        Args:
            vector: The query vector (typically a user embedding).
            k: Number of nearest neighbors to return.

        Returns:
            List of the k nearest item IDs, sorted by similarity descending.

        Note: In production (FAISS, Pinecone), this is highly optimized.
        The in-memory implementation does brute-force search for clarity.
        """
        ...

    def clear(self) -> None:
        """Delete all stored vectors.

        Useful for testing and cleanup.
        """
        ...


class InMemoryVectorDB:
    """Simple in-memory vector database.

    Stores item vectors in a Python dict. Suitable for demo, testing,
    and small datasets (< 1M items). For larger datasets or production,
    use a specialized backend like FAISS.

    No persistence: all data is lost on program exit.
    """

    def __init__(self) -> None:
        """Initialize an empty in-memory store."""
        self._vectors: Dict[MovieId, Vector] = {}

    def upsert(self, item_id: MovieId, vector: Vector) -> None:
        """Store or update an item's embedding."""
        self._vectors[item_id] = vector

    def get(self, item_id: MovieId) -> Vector | None:
        """Retrieve an item's embedding by ID."""
        return self._vectors.get(item_id)

    def delete(self, item_id: MovieId) -> None:
        """Delete an item's embedding."""
        self._vectors.pop(item_id, None)

    def all_ids(self) -> list[MovieId]:
        """Get all stored item IDs."""
        return list(self._vectors.keys())

    def query_nearest(self, vector: Vector, k: int = 100) -> list[MovieId]:
        """Find the k nearest items to a query vector.

        Brute-force search: compute similarity to all stored vectors,
        sort, and return top-k.
        """
        if not self._vectors:
            return []

        # Compute similarity (dot product) to all stored vectors.
        similarities: list[tuple[MovieId, float]] = []
        for item_id, stored_vec in self._vectors.items():
            score = vector.dot(stored_vec)
            similarities.append((item_id, score))

        # Sort by score descending, return top k.
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [item_id for item_id, _ in similarities[:k]]

    def clear(self) -> None:
        """Delete all stored vectors."""
        self._vectors.clear()

    def size(self) -> int:
        """Return the number of stored vectors.

        Convenience method for testing/debugging.
        """
        return len(self._vectors)
