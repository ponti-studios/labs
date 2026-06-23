"""Tests for VectorDB storage."""

from rec_sys.data.schema import MovieId, Vector
from rec_sys.storage.vector_db import InMemoryVectorDB


class TestInMemoryVectorDB:
    """Test the in-memory vector database."""

    def test_upsert_and_get(self) -> None:
        """Test storing and retrieving a vector."""
        db = InMemoryVectorDB()
        vector = Vector(embedding=[0.1, 0.2, 0.3])

        db.upsert(MovieId(0), vector)
        retrieved = db.get(MovieId(0))

        assert retrieved is not None
        assert retrieved.embedding == vector.embedding

    def test_get_nonexistent_returns_none(self) -> None:
        """Test that getting a non-existent item returns None."""
        db = InMemoryVectorDB()
        result = db.get(MovieId(999))
        assert result is None

    def test_upsert_overwrites(self) -> None:
        """Test that upserting overwrites the previous value."""
        db = InMemoryVectorDB()
        v1 = Vector(embedding=[1.0, 0.0])
        v2 = Vector(embedding=[0.0, 1.0])

        db.upsert(MovieId(0), v1)
        db.upsert(MovieId(0), v2)

        retrieved = db.get(MovieId(0))
        assert retrieved is not None
        assert retrieved.embedding == v2.embedding

    def test_delete(self) -> None:
        """Test deleting a vector."""
        db = InMemoryVectorDB()
        vector = Vector(embedding=[0.1, 0.2])

        db.upsert(MovieId(0), vector)
        db.delete(MovieId(0))

        assert db.get(MovieId(0)) is None

    def test_delete_nonexistent_is_safe(self) -> None:
        """Test that deleting a non-existent item doesn't raise."""
        db = InMemoryVectorDB()
        # Should not raise.
        db.delete(MovieId(999))

    def test_all_ids(self) -> None:
        """Test getting all stored item IDs."""
        db = InMemoryVectorDB()
        vectors = {
            MovieId(0): Vector(embedding=[1.0, 0.0]),
            MovieId(1): Vector(embedding=[0.0, 1.0]),
            MovieId(2): Vector(embedding=[1.0, 1.0]),
        }

        for item_id, vec in vectors.items():
            db.upsert(item_id, vec)

        all_ids = set(db.all_ids())
        assert all_ids == {MovieId(0), MovieId(1), MovieId(2)}

    def test_all_ids_empty(self) -> None:
        """Test all_ids on empty database."""
        db = InMemoryVectorDB()
        assert db.all_ids() == []

    def test_query_nearest(self) -> None:
        """Test finding nearest vectors."""
        db = InMemoryVectorDB()

        # Store three vectors at different angles.
        db.upsert(MovieId(0), Vector(embedding=[1.0, 0.0]))  # Right
        db.upsert(MovieId(1), Vector(embedding=[0.0, 1.0]))  # Up
        db.upsert(MovieId(2), Vector(embedding=[-1.0, 0.0]))  # Left

        # Query with a vector pointing right.
        query_vec = Vector(embedding=[1.0, 0.0])
        nearest = db.query_nearest(query_vec, k=2)

        # Should find 0 (identical) and 1 (perpendicular) before 2 (opposite).
        assert nearest[0] == MovieId(0)  # Dot product = 1.0 (best)
        assert nearest[1] == MovieId(1)  # Dot product = 0.0 (neutral)

    def test_query_nearest_respects_k(self) -> None:
        """Test that k limits the results."""
        db = InMemoryVectorDB()

        # Store 10 vectors.
        for i in range(10):
            db.upsert(MovieId(i), Vector(embedding=[float(i), 0.0]))

        # Query for top 3.
        query_vec = Vector(embedding=[9.0, 0.0])
        nearest = db.query_nearest(query_vec, k=3)

        assert len(nearest) == 3

    def test_query_nearest_empty_db(self) -> None:
        """Test querying an empty database."""
        db = InMemoryVectorDB()
        query_vec = Vector(embedding=[1.0, 0.0])
        nearest = db.query_nearest(query_vec, k=10)
        assert nearest == []

    def test_clear(self) -> None:
        """Test clearing all vectors."""
        db = InMemoryVectorDB()
        db.upsert(MovieId(0), Vector(embedding=[1.0, 0.0]))
        db.upsert(MovieId(1), Vector(embedding=[0.0, 1.0]))

        db.clear()

        assert db.all_ids() == []
        assert db.size() == 0

    def test_size(self) -> None:
        """Test the size convenience method."""
        db = InMemoryVectorDB()
        assert db.size() == 0

        db.upsert(MovieId(0), Vector(embedding=[1.0, 0.0]))
        assert db.size() == 1

        db.upsert(MovieId(1), Vector(embedding=[0.0, 1.0]))
        assert db.size() == 2

        db.delete(MovieId(0))
        assert db.size() == 1
