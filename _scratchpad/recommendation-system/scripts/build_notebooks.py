"""Generate the four learning-path notebooks.

Run once to create the .ipynb files:
    python scripts/build_notebooks.py

Each notebook imports from rec_sys.* rather than inlining code, so the
teaching focus stays on *what* and *why*, not on parsing .dat files.

Requires: nbformat (pip install nbformat)
"""

from pathlib import Path
import nbformat as nbf

NB_DIR = Path(__file__).parent.parent / "notebooks"
NB_DIR.mkdir(exist_ok=True)


def md(text: str) -> nbf.NotebookNode:
    return nbf.v4.new_markdown_cell(text.strip())


def code(src: str) -> nbf.NotebookNode:
    return nbf.v4.new_code_cell(src.strip())


def save(nb: nbf.NotebookNode, name: str) -> None:
    path = NB_DIR / name
    nbf.write(nb, path)
    print(f"  wrote {path}")


# ─────────────────────────────────────────────────────────────
# 01 – Explore the Data
# ─────────────────────────────────────────────────────────────

nb1 = nbf.v4.new_notebook()
nb1.cells = [
    md("""
# 01 – Explore the Data

Before we build anything, we need to understand what we're working with.

**MovieLens 1M** is a classic benchmark dataset:
- 6,040 users who joined the platform in 2000
- 3,706 movies rated between 1995–2000
- 1,000,209 ratings (1–5 stars)

The first thing to notice: only ~4% of all possible user-movie pairs have a rating.
That's the **sparsity problem**, and it's why collaborative filtering is hard.
"""),

    code("""
import sys
sys.path.insert(0, "../src")  # Make rec_sys importable from the notebook

from rec_sys.data import MovieLensLoader

loader = MovieLensLoader("../data/ml-1m")
loader.load()
print("Data loaded.")
"""),

    md("""
## Dataset Statistics

`loader.stats()` computes the core numbers we care about.
Sparsity is the most important: the fraction of user-movie pairs with NO rating.
"""),

    code("""
stats = loader.stats()
for key, val in stats.items():
    if isinstance(val, float):
        print(f"{key:35s}: {val:.2f}")
    else:
        print(f"{key:35s}: {val:,}")
"""),

    md("""
## Rating Distribution

Are users generous or stingy? A skewed distribution matters for the ALS model,
which treats ratings as "confidence" in an implicit preference signal.
"""),

    code("""
from collections import Counter
import matplotlib.pyplot as plt

rating_counts = Counter(r.rating for r in loader.ratings)
ratings_sorted = sorted(rating_counts.items())

fig, ax = plt.subplots(figsize=(7, 4))
ax.bar([str(r) for r, _ in ratings_sorted], [c for _, c in ratings_sorted], color="steelblue")
ax.set_xlabel("Rating value")
ax.set_ylabel("Count")
ax.set_title("Rating Distribution (MovieLens 1M)")
plt.tight_layout()
plt.show()

print(f"Most common rating: {rating_counts.most_common(1)[0]}")
"""),

    md("""
## Ratings per User

A few power users dominate. Most users have rated very few movies —
this is the "long tail" characteristic of recommendation datasets.
"""),

    code("""
from collections import Counter

ratings_per_user = Counter(r.user_id for r in loader.ratings)
counts = sorted(ratings_per_user.values())

fig, ax = plt.subplots(figsize=(7, 4))
ax.hist(counts, bins=50, color="coral", edgecolor="white")
ax.set_xlabel("Ratings per user")
ax.set_ylabel("Number of users")
ax.set_title("Ratings per User (log-scale tail visible)")
plt.tight_layout()
plt.show()

print(f"Min ratings/user: {min(counts)}")
print(f"Max ratings/user: {max(counts)}")
print(f"Median          : {counts[len(counts)//2]}")
"""),

    md("""
## Ratings per Movie

The movie distribution is even more skewed: a small number of blockbusters
dominate while thousands of movies have very few ratings.

This creates the **cold-start problem for items** too — not just new users.
"""),

    code("""
from rec_sys.model.cold_start import PopularityFallback
from rec_sys.data.schema import MovieId

popularity = PopularityFallback.compute_popularity(loader.ratings, weighting="count")
top_10 = PopularityFallback.top_k_popular(popularity, k=10)

print("Top 10 most-rated movies:")
for rank, (mid, count) in enumerate(top_10, 1):
    movie = loader.get_movie(MovieId(int(mid)))
    print(f"  {rank:2d}. {movie.title:<50s} {int(count):>5,} ratings")
"""),

    md("""
## Key Takeaways

1. **~96% sparse**: most user-movie pairs are unrated. This makes matrix factorization
   the right tool — it learns from the small fraction that *is* observed.

2. **Long tail in both users and movies**: a few items dominate; most are niche.
   A good system should surface the niche items for the right users.

3. **Average rating is ~3.6**: users tend to rate things they already like,
   introducing selection bias. The model learns from what's observed, not what's absent.

Next: `02_build_the_matrix.ipynb` — turning these ratings into a matrix.
"""),
]

save(nb1, "01_explore_the_data.ipynb")


# ─────────────────────────────────────────────────────────────
# 02 – Build the Matrix
# ─────────────────────────────────────────────────────────────

nb2 = nbf.v4.new_notebook()
nb2.cells = [
    md("""
# 02 – Build the Matrix

Collaborative filtering works on a **user-item interaction matrix**: rows are users,
columns are movies, and each cell is a rating (or 0 if unrated).

The core idea: users who have rated similar movies probably have similar taste.
We'll find those users and recommend movies they liked that you haven't seen.

This notebook builds that matrix and shows why it's represented as a *sparse* matrix.
"""),

    code("""
import sys
sys.path.insert(0, "../src")

from rec_sys.data import MovieLensLoader

loader = MovieLensLoader("../data/ml-1m")
loader.load()
"""),

    md("""
## ID Remapping

MovieLens uses 1-based IDs (user 1, movie 1, ...). ALS needs 0-based dense indices
so they can be used directly as row/column indices in a matrix.

The `MovieLensLoader` handles this transparently:
- `user_id_map[movielens_id]` → remapped 0-based index
- `user_id_reverse[remapped_id]` → original MovieLens ID

This round-trips correctly:
"""),

    code("""
# Pick an example MovieLens user ID and verify the round-trip.
movielens_uid = 42
remapped = loader.remapped_user_id(movielens_uid)
back = loader.original_user_id(int(remapped))

print(f"MovieLens user {movielens_uid} → remapped index {remapped} → back to {back}")
assert back == movielens_uid, "Round-trip failed"
print("Round-trip OK")
"""),

    md("""
## Constructing the Sparse Matrix

A dense matrix for 6,040 users × 3,706 movies = 22.4M cells.
At 4 bytes per float, that's ~90 MB — and 96% of it would be zeros.

We use `scipy.sparse.csr_matrix` instead: stores only the non-zero entries.
Memory usage drops from 90 MB to ~12 MB for the same data.

This matters a lot when you scale to millions of users.
"""),

    code("""
from scipy import sparse
import numpy as np

# Build coordinate lists: row = user, col = movie, data = rating.
rows = [int(r.user_id) for r in loader.ratings]
cols = [int(r.movie_id) for r in loader.ratings]
data = [r.rating for r in loader.ratings]

n_users = loader.num_users
n_movies = loader.num_items

# Construct sparse matrix in COO format, then convert to CSR.
# COO is easy to build; CSR is efficient for row-slicing (per-user operations).
rating_matrix = sparse.coo_matrix(
    (data, (rows, cols)),
    shape=(n_users, n_movies),
).tocsr()

print(f"Matrix shape     : {rating_matrix.shape}")
print(f"Non-zero entries : {rating_matrix.nnz:,}")
print(f"Density          : {100 * rating_matrix.nnz / (n_users * n_movies):.2f}%")
print(f"Memory (sparse)  : {rating_matrix.data.nbytes / 1e6:.1f} MB")
print(f"Memory (dense)   : {n_users * n_movies * 4 / 1e6:.0f} MB")
"""),

    md("""
## Visualising a Slice

Looking at the full matrix is too big. Let's look at the first 100 users × 100 movies
to get a feel for the sparsity pattern.

Each dot = a rating. The white space = missing data the model must fill in.
"""),

    code("""
import matplotlib.pyplot as plt

# Extract the first 100x100 block as a dense array for visualisation.
slice_dense = rating_matrix[:100, :100].toarray()

fig, ax = plt.subplots(figsize=(8, 7))
im = ax.imshow(slice_dense, aspect="auto", cmap="YlOrRd", interpolation="nearest")
ax.set_xlabel("Movie index (0-99)")
ax.set_ylabel("User index (0-99)")
ax.set_title("User-Movie Rating Matrix (first 100×100) — white = unrated")
plt.colorbar(im, ax=ax, label="Rating")
plt.tight_layout()
plt.show()
"""),

    md("""
## The Cold-Start Problem Visualised

Some users have many ratings (dense rows); some have very few (sparse rows).
Users with very few ratings are the cold-start problem — not enough signal
for the model to learn reliable preferences.

The popularity fallback from `cold_start.py` handles these users.
"""),

    code("""
from collections import Counter
from rec_sys.model.cold_start import PopularityFallback
from rec_sys.data.schema import MovieId

ratings_per_user = Counter(int(r.user_id) for r in loader.ratings)

# Cold-start threshold: users with ≤5 ratings.
cold_start_users = [uid for uid, cnt in ratings_per_user.items() if cnt <= 5]
warm_users = [uid for uid, cnt in ratings_per_user.items() if cnt > 5]

print(f"Cold-start users (≤5 ratings): {len(cold_start_users):,} ({100*len(cold_start_users)/len(ratings_per_user):.1f}%)")
print(f"Warm users (>5 ratings)       : {len(warm_users):,} ({100*len(warm_users)/len(ratings_per_user):.1f}%)")

# What would cold-start users get?
popularity = PopularityFallback.compute_popularity(loader.ratings, weighting="hybrid")
top5 = PopularityFallback.top_k_popular(popularity, k=5)
print("\\nCold-start fallback (top-5 popular):")
for rank, (mid, score) in enumerate(top5, 1):
    movie = loader.get_movie(MovieId(int(mid)))
    print(f"  {rank}. {movie.title}")
"""),

    md("""
## Key Takeaways

1. **Sparse representation is essential** — storing the full dense matrix would waste 96% of the space.

2. **ID remapping is required** — ALS uses matrix indices directly, so we need contiguous 0-based IDs.

3. **Cold-start is real** — users with few ratings will get poor collaborative recommendations.
   Popularity fallback is a simple, effective baseline.

Next: `03_train_the_model.ipynb` — factorising this matrix with ALS to learn embeddings.
"""),
]

save(nb2, "02_build_the_matrix.ipynb")


# ─────────────────────────────────────────────────────────────
# 03 – Train the Model
# ─────────────────────────────────────────────────────────────

nb3 = nbf.v4.new_notebook()
nb3.cells = [
    md("""
# 03 – Train the Model

We have a sparse user-movie matrix. Now we factorise it.

**Alternating Least Squares (ALS)** decomposes the matrix into two low-rank factor matrices:
- **User factors** U: shape (n_users, k) — each user is a k-dimensional vector
- **Item factors** V: shape (n_movies, k) — each movie is a k-dimensional vector

Predicted rating = U[user] · V[movie] (dot product)

ALS alternates between solving for U (fixing V) and solving for V (fixing U),
repeating until convergence. Both sub-problems are simple linear regression.

The result: each user and movie has a compact representation (embedding) that
encodes taste/genre/style without ever using explicit labels.
"""),

    code("""
import sys
sys.path.insert(0, "../src")

from rec_sys.data import MovieLensLoader
from rec_sys.model import ALSTrainer

loader = MovieLensLoader("../data/ml-1m")
loader.load()
print(f"Loaded {loader.num_users:,} users, {loader.num_items:,} movies, {len(loader.ratings):,} ratings")
"""),

    md("""
## Training

`ALSTrainer` wraps the `implicit` library. Key hyperparameters:
- `factors` (k): embedding dimensionality. More = more expressive, slower, more memory.
- `iterations`: how many ALS passes. 10–20 is usually enough for convergence.
- `reg`: L2 regularisation. Prevents overfitting by penalising large factor values.
"""),

    code("""
import time

trainer = ALSTrainer(factors=64, iterations=20, reg=0.01)

start = time.time()
trainer.train(
    ratings=loader.ratings,
    num_users=loader.num_users,
    num_items=loader.num_items,
)
elapsed = time.time() - start

print(f"Training time    : {elapsed:.1f}s")
print(f"User factor shape: {trainer.user_factors.shape}")
print(f"Item factor shape: {trainer.item_factors.shape}")
"""),

    md("""
## Inspecting the Embeddings

Each user and movie now has a 64-dimensional vector. Let's look at what the
factors for a couple of users look like.

The values are continuous and don't have explicit meaning — the model learns
whatever representation minimises the reconstruction error on the observed ratings.
"""),

    code("""
import matplotlib.pyplot as plt
import numpy as np

# Sample three users and visualise their factor vectors.
fig, axes = plt.subplots(3, 1, figsize=(12, 5))
for i, uid in enumerate([0, 100, 500]):
    vec = trainer.get_user_vector(trainer.__class__.__mro__[0].__module__)  # placeholder
    factors = trainer.user_factors[uid]
    axes[i].bar(range(64), factors, color="steelblue", alpha=0.7)
    axes[i].set_ylabel(f"User {uid}")
    axes[i].axhline(0, color="black", linewidth=0.5)
axes[-1].set_xlabel("Factor dimension")
fig.suptitle("User Factor Vectors (64 dimensions)")
plt.tight_layout()
plt.show()
"""),

    md("""
## Dot Product as Similarity

The predicted affinity of user u for movie i is `U[u] · V[i]`.

Two vectors with high dot product are "aligned" — the user's taste vector
points in the same direction as the movie's feature vector.

Let's score user 1's affinity for a few known movies:
"""),

    code("""
from rec_sys.data.schema import UserId, MovieId

# User 1's history.
uid = loader.remapped_user_id(1)
user_ratings = [r for r in loader.ratings if r.user_id == uid]
print(f"User 1 has rated {len(user_ratings)} movies")

user_vec = trainer.get_user_vector(uid)

# Score a sample of movies and show the top and bottom.
sample_movie_ids = list(loader.movies.keys())[:200]
scores = []
for mid in sample_movie_ids:
    item_vec = trainer.get_item_vector(mid)
    score = user_vec.dot(item_vec)
    movie = loader.get_movie(mid)
    scores.append((movie.title, score))

scores.sort(key=lambda x: x[1], reverse=True)

print("\\nTop 5 predicted:")
for title, score in scores[:5]:
    print(f"  {title:<50s} {score:.4f}")

print("\\nBottom 5 predicted:")
for title, score in scores[-5:]:
    print(f"  {title:<50s} {score:.4f}")
"""),

    md("""
## Factor Norms: What the Model Learned

The *norm* (length) of an item's factor vector measures how strongly opinionated
the model is about that item. High norm = divisive movie (people either love or hate it).
Low norm = neutral movie (everyone rates it similarly, nothing to distinguish).
"""),

    code("""
import numpy as np
from rec_sys.data.schema import MovieId

# Compute norms for all item vectors.
item_norms = []
for mid, movie in list(loader.movies.items())[:500]:  # First 500 for speed
    vec = trainer.get_item_vector(mid)
    norm = vec.norm()
    item_norms.append((movie.title, norm))

item_norms.sort(key=lambda x: x[1], reverse=True)

print("Most 'opinionated' movies (high norm = model has strong signal):")
for title, norm in item_norms[:8]:
    print(f"  {title:<50s} {norm:.4f}")

print("\\nMost 'neutral' movies (low norm = weak signal / few ratings):")
for title, norm in item_norms[-8:]:
    print(f"  {title:<50s} {norm:.4f}")
"""),

    md("""
## Key Takeaways

1. **Embeddings are learned** — ALS discovers latent factors from co-rating patterns,
   not from movie metadata. Genre, tone, era emerge implicitly.

2. **Dot product = predicted affinity** — higher score means the model thinks
   the user will like the item. This is what drives recommendations.

3. **Factor norms reveal item signal strength** — popular/divisive movies have
   bigger vectors because the model has more evidence for them.

4. **64 factors is a reasonable default** — too few and the model underfits;
   too many and it overfits and is slow. 32–128 is the typical range.

Next: `04_serve_recommendations.ipynb` — using these embeddings to generate real recs.
"""),
]

save(nb3, "03_train_the_model.ipynb")


# ─────────────────────────────────────────────────────────────
# 04 – Serve Recommendations
# ─────────────────────────────────────────────────────────────

nb4 = nbf.v4.new_notebook()
nb4.cells = [
    md("""
# 04 – Serve Recommendations

We have trained embeddings. Now we use them to generate recommendations.

**The two-phase serving model:**
1. **Retrieval** — quickly find ~500 candidate movies that are broadly relevant
2. **Ranking** — score each candidate precisely and return the top N

In production these are separate systems. The retrieval phase uses an
approximate nearest-neighbor index (FAISS, Pinecone) for speed.
The ranking phase can be a more expensive model (neural net, gradient boosting).

Here both phases use dot-product similarity on ALS embeddings — simple and effective.
"""),

    code("""
import sys
sys.path.insert(0, "../src")

from rec_sys.data import MovieLensLoader
from rec_sys.data.schema import MovieId, UserId
from rec_sys.model import ALSTrainer
from rec_sys.pipeline.batch import BatchJob
from rec_sys.pipeline.serving import Recommender
from rec_sys.storage.user_cache import InMemoryUserCache
from rec_sys.storage.vector_db import InMemoryVectorDB

# Run the full batch job to populate all stores.
loader = MovieLensLoader("../data/ml-1m")
trainer = ALSTrainer(factors=64, iterations=20)
vector_db = InMemoryVectorDB()
user_cache = InMemoryUserCache()

job = BatchJob(loader=loader, trainer=trainer, vector_db=vector_db, user_cache=user_cache)
job.run()

rec = Recommender(
    vector_db=vector_db,
    user_cache=user_cache,
    trainer=trainer,
    popularity_scores=job.popularity_scores,
)
print("System ready.")
"""),

    md("""
## Personalized Recommendations

`recommend_for_user` runs the full retrieval + filter + rank pipeline:
1. Get user's embedding from the trained model
2. Query vector DB for the N·3 nearest movies
3. Remove movies the user has already rated
4. Return top N by similarity score
"""),

    code("""
def show_recs(movielens_uid: int, n: int = 10) -> None:
    uid = loader.remapped_user_id(movielens_uid)
    user_ratings = user_cache.get_user_ratings(uid) or []

    print(f"User {movielens_uid}  ({len(user_ratings)} ratings in history)")
    print(f"\\nRecently rated (sample):")
    for r in sorted(user_ratings, key=lambda x: x.rating, reverse=True)[:5]:
        movie = loader.get_movie(r.movie_id)
        print(f"  ★{r.rating:.0f}  {movie.title}")

    recs = rec.recommend_for_user(uid, n=n)
    print(f"\\nTop {n} recommendations:")
    for rank, (mid, score) in enumerate(recs, 1):
        movie = loader.get_movie(MovieId(int(mid)))
        print(f"  {rank:2d}. {movie.title:<50s}  ({score:.4f})")

show_recs(1)
"""),

    code("""
# Try a different user profile.
show_recs(500)
"""),

    md("""
## Similar Items

`get_similar_items` finds movies most similar to a reference movie.
The logic: use the movie's embedding as the query, find nearest neighbors,
exclude the reference itself.

This is what "customers also bought" / "because you watched X" surfaces.
"""),

    code("""
def show_similar(title_query: str, n: int = 10) -> None:
    # Case-insensitive substring match on title.
    matches = [
        (mid, movie) for mid, movie in loader.movies.items()
        if title_query.lower() in movie.title.lower()
    ]
    if not matches:
        print(f"No movies found matching '{title_query}'")
        return

    ref_id, ref_movie = matches[0]
    similar = rec.get_similar_items(ref_id, n=n)

    print(f"Movies similar to: {ref_movie.title}\\n")
    for rank, (sid, score) in enumerate(similar, 1):
        sm = loader.get_movie(MovieId(int(sid)))
        print(f"  {rank:2d}. {sm.title:<50s}  ({score:.4f})")

show_similar("Toy Story")
"""),

    code("""
show_similar("Terminator")
"""),

    md("""
## Cold-Start: New Users

A brand-new user has no history. We fall back to popular items.

The three weighting strategies show different tradeoffs:
- **count**: most-watched — broadly safe but obvious
- **average**: highest-rated — biased toward obscure films with few reviews
- **hybrid**: count × average — balances breadth and quality
"""),

    code("""
from rec_sys.model.cold_start import PopularityFallback

for weighting in ("count", "average", "hybrid"):
    popularity = PopularityFallback.compute_popularity(loader.ratings, weighting=weighting)
    top5 = PopularityFallback.top_k_popular(popularity, k=5)
    print(f"Top 5 by '{weighting}':")
    for rank, (mid, score) in enumerate(top5, 1):
        movie = loader.get_movie(MovieId(int(mid)))
        print(f"  {rank}. {movie.title:<50s}  ({score:.1f})")
    print()
"""),

    md("""
## The Full Pipeline at a Glance

```
BATCH (offline, runs daily)
─────────────────────────────────────────
MovieLensLoader  →  ratings matrix
ALSTrainer       →  user vectors + item vectors
InMemoryVectorDB ←  item vectors stored
InMemoryUserCache←  user history stored
PopularityFallback←  cold-start scores stored

SERVING (online, per request)
─────────────────────────────────────────
UserId → get user vector from trainer
         → query_nearest(user_vec, k=500) from VectorDB
         → filter already-seen items from UserCache
         → top_k(n=10) by dot product
         → return recommendations
```

For new users: skip to popularity fallback.

## What to Try Next

- Swap `InMemoryVectorDB` for **FAISS** (approximate nearest neighbors, 100x faster at scale)
- Add a **re-ranking** step with additional signals (recency, diversity, novelty)
- Implement **temporal decay**: downweight old ratings to capture taste drift
- Explore **hybrid models**: blend collaborative filtering with item content features (genres, directors)
- Add an **A/B test framework**: compare two recommendation strategies with real users
"""),
]

save(nb4, "04_serve_recommendations.ipynb")

print("\nAll notebooks written to notebooks/")
