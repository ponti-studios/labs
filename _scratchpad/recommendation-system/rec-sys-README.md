# rec-sys: Unified Recommendation System

A unified Python package combining the **learning path** (notebooks) and **production architecture** (pipeline) for building collaborative filtering recommendation systems.

This package teaches both the mechanics (matrix factorization via ALS) and the systems design (batch training, vector storage, online serving), all importable and testable.

## Quick Start

### Install

```bash
pip install -e .
```

### Download Data

Download MovieLens 1M from https://grouplens.org/datasets/movielens/1m/ and extract it:

```bash
mkdir -p data/ml-1m
# Extract ml-1m.zip into data/ml-1m/
# Should have: data/ml-1m/ratings.dat, data/ml-1m/movies.dat, data/ml-1m/users.dat
```

### Load and Explore

```python
from rec_sys.data import MovieLensLoader

loader = MovieLensLoader("data/ml-1m")
loader.load()

# Print statistics
stats = loader.stats()
print(f"Users: {stats['num_users']}")
print(f"Movies: {stats['num_movies']}")
print(f"Ratings: {stats['num_ratings']}")
print(f"Sparsity: {stats['sparsity_percent']:.1f}%")
```

## Package Structure

```
src/rec_sys/
├── data/           # Dataset loading and domain types
│   ├── schema.py   # User, Movie, Rating, Vector
│   └── loader.py   # MovieLensLoader with ID remapping
│
├── model/          # ML components (phases 3)
│   ├── trainer.py
│   ├── embeddings.py
│   └── cold_start.py
│
├── storage/        # Storage protocols (phase 4)
│   ├── vector_db.py
│   └── user_cache.py
│
├── pipeline/       # End-to-end workflows (phase 5)
│   ├── batch.py
│   └── serving.py
│
└── cli.py          # CLI entry points (phase 7)
```

## Key Concepts

### ID Remapping

MovieLens uses 1-based user and movie IDs. Alternating Least Squares (ALS) requires 0-based dense indices. The loader handles this transparently:

- **Forward mapping:** MovieLens ID → remapped index (for internal computation)
- **Reverse mapping:** remapped index → MovieLens ID (for serving)

This lets notebooks and scripts work with raw data while the training pipeline uses dense indices.

### Domain Types

All entities are defined in `schema.py`:

- **User**: A user identified by remapped ID
- **Movie**: A movie with title (genres available but unused)
- **Rating**: A user's rating of a movie (1-5)
- **Vector**: An embedding from ALS factorization (dot product = similarity)

### Vector Math

The `Vector` type includes:
- `dot(other)`: Similarity via dot product (core scoring operation)
- `norm()`: Euclidean norm (for cosine similarity if needed)

## Development

### Run Tests

```bash
pytest tests/
```

### Run Tests with Coverage

```bash
pytest --cov=rec_sys tests/
```

### Type Check

```bash
mypy src/
```

### Format

```bash
black src/ tests/
ruff check src/ tests/
```

## Phases

| Phase | Module | Status | Notes |
|---|---|---|---|
| 1-2 | `data/` | ✅ Done | Load MovieLens, remap IDs, provide stats |
| 3 | `model/` | ⏳ Next | ALS trainer, embeddings, cold-start |
| 4 | `storage/` | ⏳ Next | Protocols for vector DB and cache |
| 5 | `pipeline/` | ⏳ Next | Batch job and serving recommender |
| 6 | `cli.py` | ⏳ Next | CLI commands |
| 7 | `scripts/` | ⏳ Next | End-to-end demos |
| 8 | `notebooks/` | ⏳ Next | Port learning path to use package |
| 9 | `tests/` | ⏳ Growing | Unit + integration tests |

## Notebooks (Planned)

When complete, the notebooks will provide a structured learning path:

1. **01_explore_the_data.ipynb** — Load MovieLens, show distribution, sparsity
2. **02_build_the_matrix.ipynb** — User-item matrix, cold-start problem
3. **03_train_the_model.ipynb** — ALS factorization, factor interpretation
4. **04_serve_recommendations.ipynb** — Retrieval, ranking, nearest neighbors

Each notebook imports from `rec_sys.*` rather than inlining code, keeping notebooks thin and focused on explanation.

## References

- [MovieLens Datasets](https://grouplens.org/datasets/movielens/)
- [Implicit Library (ALS)](https://github.com/benfred/implicit)
- [Matrix Factorization Techniques for Recommender Systems](https://datajobs.com/data-science-repo/Recommender-Systems-%5BNetflix-Prize%5D.pdf)
