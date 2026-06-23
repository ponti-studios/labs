# Architecture

This document maps the system's Python modules to their conceptual roles
and to the original Go reference implementation that inspired the design.

---

## System Overview

The recommendation system has two phases that run at different cadences:

```
┌─────────────────────────────────────────────────────────────────┐
│  BATCH PHASE  (offline — runs daily, takes minutes)             │
│                                                                  │
│  MovieLensLoader ──► ALSTrainer ──► InMemoryVectorDB            │
│        │                                └── item embeddings     │
│        └───────────────────────────────► InMemoryUserCache      │
│                                              └── user history   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SERVING PHASE  (online — runs per request, takes milliseconds) │
│                                                                  │
│  user_id ──► get_user_vector() ──► query_nearest(k=500)         │
│                                         │                        │
│                                    filter_seen_items()           │
│                                         │                        │
│                                    top_k(n=10)                   │
│                                         │                        │
│                                    recommendations               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Map

### `src/rec_sys/data/`

| File | Role | Go equivalent |
|---|---|---|
| `schema.py` | Domain types: `User`, `Movie`, `Rating`, `Vector` | Structs in `model.go` |
| `loader.py` | Reads MovieLens `.dat` files, remaps IDs to 0-based indices | `loader.go` |

**Why ID remapping?** ALS uses dense matrix indices. MovieLens IDs are 1-based
and sparse (gaps possible). The loader maintains forward (`movielens → internal`)
and reverse (`internal → movielens`) maps so the rest of the system uses clean
0-based indices while serving can translate back to original IDs.

---

### `src/rec_sys/model/`

| File | Role | Go equivalent |
|---|---|---|
| `trainer.py` | Wraps `implicit.als.AlternatingLeastSquares`, produces factor matrices | `train.go` |
| `embeddings.py` | Nearest-neighbor retrieval, filtering, scoring utilities | `embeddings.go` |
| `cold_start.py` | Popularity-based fallback for new users | `cold_start.go` |

**ALS in brief:** Factorises the sparse user-item matrix R ≈ U × Vᵀ where:
- U has shape `(n_users, k)` — one k-dim vector per user
- V has shape `(n_items, k)` — one k-dim vector per item
- Predicted affinity for user u and item i = `U[u] · V[i]`

The key hyperparameters:

| Parameter | Default | Effect |
|---|---|---|
| `factors` (k) | 64 | Embedding dimensionality. Higher = more expressive, slower. |
| `iterations` | 20 | ALS passes. More = better fit, diminishing returns past 20. |
| `reg` | 0.01 | L2 regularisation. Prevents overfitting. |

---

### `src/rec_sys/storage/`

| File | Role | Go equivalent |
|---|---|---|
| `vector_db.py` | `VectorDB` protocol + `InMemoryVectorDB` implementation | `vector_db.go` |
| `user_cache.py` | `UserCache` protocol + `InMemoryUserCache` implementation | `user_cache.go` |

Both files follow the same pattern: a **Python Protocol** (structural interface)
plus a simple in-memory implementation. New backends (FAISS, Redis, Pinecone)
implement the same Protocol without touching the pipeline code.

**Production swap guide:**

| Current | Production alternative | Why |
|---|---|---|
| `InMemoryVectorDB` | FAISS | Approximate nearest-neighbor at scale (10M+ items) |
| `InMemoryVectorDB` | Pinecone / Milvus | Managed vector DB, no infra overhead |
| `InMemoryUserCache` | Redis | Persistent, TTL, horizontal scaling |
| `InMemoryUserCache` | PostgreSQL | Durable, queryable, joins with user metadata |

---

### `src/rec_sys/pipeline/`

| File | Role | Go equivalent |
|---|---|---|
| `batch.py` | `BatchJob`: orchestrates load → train → store | `batch.go` / `main.go` batch path |
| `serving.py` | `Recommender`: retrieval → filter → rank per request | `feed.go` |

**BatchJob constructor:**
```python
BatchJob(
    loader=MovieLensLoader("data/ml-1m"),   # any DataLoader
    trainer=ALSTrainer(factors=64),          # any trainer
    vector_db=InMemoryVectorDB(),            # any VectorDB
    user_cache=InMemoryUserCache(),          # any UserCache
)
```

**Recommender constructor:**
```python
Recommender(
    vector_db=batch.vector_db,
    user_cache=batch.user_cache,
    trainer=batch.trainer,
    popularity_scores=batch.popularity_scores,
)
```

Dependency injection means neither class is coupled to the concrete implementation.
Swap `InMemoryVectorDB` for FAISS by changing one line in the constructor.

---

### `src/rec_sys/cli.py`

Four commands that map 1:1 to the two pipeline phases:

```
rec-sys batch        → BatchJob.run()
rec-sys recommend    → Recommender.recommend_hybrid()
rec-sys similar      → Recommender.get_similar_items()
rec-sys popular      → PopularityFallback.top_k_popular()
```

---

## Data Flow End-to-End

```
data/ml-1m/
  ratings.dat
  movies.dat
  users.dat
       │
       ▼
MovieLensLoader.load()
  ├── users: {UserId → User}
  ├── movies: {MovieId → Movie}
  ├── ratings: [Rating]
  ├── user_id_map: {movielens_id → remapped_idx}
  └── movie_id_map: {movielens_id → remapped_idx}
       │
       ▼
ALSTrainer.train(ratings, num_users, num_items)
  ├── builds scipy.sparse.csr_matrix (shape: users × movies)
  ├── runs implicit.als.AlternatingLeastSquares.fit()
  ├── user_factors: ndarray (n_users × k)
  └── item_factors: ndarray (n_items × k)
       │
       ├──► InMemoryVectorDB.upsert(movie_id, Vector)  [all items]
       └──► InMemoryUserCache.set_user_ratings(user_id, ratings)  [all users]

                    ─── serving time ───

user_id
  │
  ▼
ALSTrainer.get_user_vector(user_id) → Vector
  │
  ▼
InMemoryVectorDB.query_nearest(user_vector, k=500) → [MovieId]
  │
  ▼
InMemoryUserCache.get_user_rated_items(user_id) → {MovieId}
  │
  ▼
Embeddings.filter_seen_items(candidates, seen) → filtered candidates
  │
  ▼
Embeddings.top_k(candidates, n=10) → [(MovieId, score)]
```

---

## The Learning Path (Notebooks)

The four notebooks in `notebooks/` walk through the system bottom-up:

| Notebook | Key concept | Module used |
|---|---|---|
| `01_explore_the_data.ipynb` | Sparsity, long tail, cold-start problem | `data.loader`, `model.cold_start` |
| `02_build_the_matrix.ipynb` | Sparse matrices, ID remapping | `data.loader` |
| `03_train_the_model.ipynb` | ALS factorisation, embeddings, dot product | `model.trainer` |
| `04_serve_recommendations.ipynb` | Retrieval, filtering, ranking, cold-start | `pipeline.batch`, `pipeline.serving` |

Each notebook imports from `rec_sys.*` — the heavy code lives in the package,
not inline in the notebook cells. This keeps notebooks stable when you refactor
the implementation.

---

## Testing Strategy

Tests are co-located with their modules and use lightweight fixtures:

```
tests/
  conftest.py             # 3-user, 3-movie fixture (no real data needed)
  data/test_loader.py     # ID remapping, stats, round-trips
  model/test_trainer.py   # ALS trains, dimensions match, vectors differ
  model/test_embeddings.py# Nearest-neighbor ordering, filtering
  model/test_cold_start.py# Popularity weighting, blending
  storage/test_vector_db.py   # CRUD, query_nearest ordering
  storage/test_user_cache.py  # CRUD, rated-items extraction
  pipeline/test_batch.py  # Full pipeline on MockDataLoader
  pipeline/test_serving.py# Recommendations, cold-start fallback, similar items
```

All tests run without the MovieLens data download (`pytest tests/`).
End-to-end demos that need the data are in `scripts/`.
