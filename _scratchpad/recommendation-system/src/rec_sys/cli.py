"""CLI entry points for the recommendation system.

Four commands implement the two-phase architecture:

  rec-sys batch        -- Train the model, save to ~/.rec-sys/
  rec-sys recommend    -- Load model, get recommendations for a user
  rec-sys similar      -- Load model, find similar movies
  rec-sys popular      -- Load model, show popular movies (cold-start)

The batch command must run first. It trains on the MovieLens data and saves
the trained model and stores to disk (~/.rec-sys/). Subsequent commands
load from disk, avoiding re-training.
"""

import argparse
import sys
from pathlib import Path

from rec_sys.data.loader import MovieLensLoader
from rec_sys.data.schema import MovieId
from rec_sys.model.trainer import ALSTrainer
from rec_sys.persistence import clear_state, load_state, save_state
from rec_sys.pipeline.batch import BatchJob
from rec_sys.pipeline.serving import Recommender
from rec_sys.storage.user_cache import InMemoryUserCache
from rec_sys.storage.vector_db import InMemoryVectorDB


# ── Command implementations ───────────────────────────────────────────────────


def cmd_batch(args: argparse.Namespace) -> None:
    """Run offline batch training and save to disk."""
    loader = MovieLensLoader(args.data_dir)
    trainer = ALSTrainer(factors=args.factors, iterations=args.iterations)
    vector_db = InMemoryVectorDB()
    user_cache = InMemoryUserCache()

    job = BatchJob(
        loader=loader,
        trainer=trainer,
        vector_db=vector_db,
        user_cache=user_cache,
    )
    job.run()

    # Save to disk for subsequent commands.
    save_state(
        trainer=job.trainer,
        vector_db=vector_db,
        user_cache=user_cache,
        popularity_scores=job.popularity_scores,
        state_dir=args.state_dir,
    )
    print(f"\nModel trained and saved. Run 'rec-sys recommend --user 1' to test.")


def cmd_recommend(args: argparse.Namespace) -> None:
    """Get top-N recommendations for a user."""
    # Load the pre-trained model from disk.
    try:
        trainer, vector_db, user_cache, popularity_scores = load_state(args.state_dir)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Load the data to map user IDs.
    loader = MovieLensLoader(args.data_dir)
    loader.load()

    rec = Recommender(
        vector_db=vector_db,
        user_cache=user_cache,
        trainer=trainer,
        popularity_scores=popularity_scores,
    )

    # Convert MovieLens user ID (1-based) to internal remapped ID.
    try:
        user_id = loader.remapped_user_id(args.user)
    except ValueError:
        print(f"Error: User {args.user} not found in dataset.", file=sys.stderr)
        sys.exit(1)

    recommendations = rec.recommend_hybrid(user_id, n=args.n)

    print(f"\nTop {args.n} recommendations for user {args.user}:\n")
    if not recommendations:
        print("  No recommendations found (user may have rated all items).")
        return

    for rank, (movie_id, score) in enumerate(recommendations, 1):
        movie = loader.get_movie(MovieId(int(movie_id)))
        print(f"  {rank:2d}. {movie.title:<50s}  (score: {score:.4f})")


def cmd_similar(args: argparse.Namespace) -> None:
    """Find movies similar to a given title."""
    # Load the pre-trained model from disk.
    try:
        trainer, vector_db, user_cache, popularity_scores = load_state(args.state_dir)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Load the data to map movie titles.
    loader = MovieLensLoader(args.data_dir)
    loader.load()

    rec = Recommender(
        vector_db=vector_db,
        user_cache=user_cache,
        trainer=trainer,
        popularity_scores=popularity_scores,
    )

    # Find the movie by title (case-insensitive substring match).
    query = args.movie.lower()
    matches = [
        (mid, movie)
        for mid, movie in loader.movies.items()
        if query in movie.title.lower()
    ]

    if not matches:
        print(f"Error: No movies found matching '{args.movie}'.", file=sys.stderr)
        sys.exit(1)

    # Use the first match.
    movie_id, movie = matches[0]
    if len(matches) > 1:
        print(f"Multiple matches found. Using: {movie.title}")

    similar = rec.get_similar_items(movie_id, n=args.n)

    print(f"\nMovies similar to '{movie.title}':\n")
    for rank, (sim_id, score) in enumerate(similar, 1):
        sim_movie = loader.get_movie(MovieId(int(sim_id)))
        print(f"  {rank:2d}. {sim_movie.title:<50s}  (score: {score:.4f})")


def cmd_popular(args: argparse.Namespace) -> None:
    """Show the most popular movies (cold-start view)."""
    # Load the pre-trained model from disk.
    try:
        trainer, vector_db, user_cache, popularity_scores = load_state(args.state_dir)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Load the data to map movie IDs.
    loader = MovieLensLoader(args.data_dir)
    loader.load()

    top_items = sorted(
        popularity_scores.items(),
        key=lambda x: x[1],
        reverse=True,
    )[:args.n]

    print(f"\nTop {args.n} popular movies:\n")
    for rank, (movie_id, score) in enumerate(top_items, 1):
        movie = loader.get_movie(MovieId(int(movie_id)))
        print(f"  {rank:2d}. {movie.title:<50s}  (score: {score:.1f})")


# ── Argument parser ───────────────────────────────────────────────────────────


def _build_parser() -> argparse.ArgumentParser:
    """Build the CLI argument parser."""
    parser = argparse.ArgumentParser(
        prog="rec-sys",
        description="MovieLens recommendation system",
    )

    # Shared arguments added to every subcommand.
    shared = argparse.ArgumentParser(add_help=False)
    shared.add_argument(
        "--data-dir",
        default="data/ml-1m",
        help="Path to MovieLens 1M data directory (default: data/ml-1m)",
    )
    shared.add_argument(
        "--state-dir",
        type=Path,
        default=Path.home() / ".rec-sys",
        help="Directory to save/load model state (default: ~/.rec-sys)",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # batch
    batch_parser = subparsers.add_parser(
        "batch",
        help="Train model and save to disk",
        parents=[shared],
    )
    batch_parser.add_argument(
        "--factors",
        type=int,
        default=64,
        help="Number of ALS latent factors (default: 64)",
    )
    batch_parser.add_argument(
        "--iterations",
        type=int,
        default=20,
        help="Number of ALS training iterations (default: 20)",
    )

    # recommend
    rec_parser = subparsers.add_parser(
        "recommend",
        help="Get recommendations for a user",
        parents=[shared],
    )
    rec_parser.add_argument(
        "--user",
        type=int,
        required=True,
        help="MovieLens user ID (1-based)",
    )
    rec_parser.add_argument(
        "--n",
        type=int,
        default=10,
        help="Number of recommendations (default: 10)",
    )

    # similar
    sim_parser = subparsers.add_parser(
        "similar",
        help="Find movies similar to a title",
        parents=[shared],
    )
    sim_parser.add_argument(
        "--movie",
        type=str,
        required=True,
        help="Movie title (substring match)",
    )
    sim_parser.add_argument(
        "--n",
        type=int,
        default=10,
        help="Number of similar movies (default: 10)",
    )

    # popular
    pop_parser = subparsers.add_parser(
        "popular",
        help="Show most popular movies (cold-start view)",
        parents=[shared],
    )
    pop_parser.add_argument(
        "--n",
        type=int,
        default=10,
        help="Number of popular movies (default: 10)",
    )

    return parser


def main() -> None:
    """Entry point for the `rec-sys` CLI command."""
    parser = _build_parser()
    args = parser.parse_args()

    dispatch = {
        "batch": cmd_batch,
        "recommend": cmd_recommend,
        "similar": cmd_similar,
        "popular": cmd_popular,
    }

    dispatch[args.command](args)


if __name__ == "__main__":
    main()
