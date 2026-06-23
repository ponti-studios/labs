"""
MovieLens dataset loader and ID remapping.

The MovieLens 1M dataset uses 1-based user and item IDs (e.g., user 1, movie 1).
Alternating Least Squares (ALS) for matrix factorization requires 0-based dense
indices that map onto a matrix: row i = user with ID i, column j = movie with ID j.

This loader reads the raw .dat files, remaps to 0-based IDs, and stores both
the original→remapped and remapped→original mappings so we can translate back
when serving recommendations (e.g., "recommend movie 42" means the internal ID
remapped_movie_id, which maps back to MovieLens ID 42).
"""

from pathlib import Path
from typing import Dict, Tuple

from rec_sys.data.schema import Movie, MovieId, Rating, User, UserId


class MovieLensLoader:
    """Loads MovieLens 1M dataset and manages ID remapping.

    MovieLens 1M is a standard benchmark dataset available at:
    https://grouplens.org/datasets/movielens/1m/

    It contains:
      - 6,040 users
      - 3,706 movies
      - 1,000,209 ratings (on a scale of 1-5)

    The loader reads three tab-separated files:
      - users.dat: user demographics (age, gender, occupation, zip)
      - movies.dat: movie titles and genres
      - ratings.dat: user ratings of movies with timestamps
    """

    def __init__(self, data_dir: str | Path):
        """Initialize the loader. Does not read files yet."""
        self.data_dir = Path(data_dir)

        # Mappings between MovieLens IDs and our remapped 0-based indices.
        # Example: if MovieLens has users 1, 3, 5 (sparse IDs), we remap to 0, 1, 2.
        # user_id_map[1] = 0, user_id_map[3] = 1, user_id_map[5] = 2
        # user_id_reverse[0] = 1, user_id_reverse[1] = 3, user_id_reverse[2] = 5
        self.user_id_map: Dict[int, int] = {}  # MovieLens ID -> remapped index
        self.user_id_reverse: Dict[int, int] = {}  # remapped index -> MovieLens ID
        self.movie_id_map: Dict[int, int] = {}
        self.movie_id_reverse: Dict[int, int] = {}

        # Loaded entities. Load on demand (lazy) when load() is called.
        self.users: Dict[UserId, User] = {}
        self.movies: Dict[MovieId, Movie] = {}
        self.ratings: list[Rating] = []

    def load(self) -> None:
        """Read all three MovieLens files and populate entities.

        This is called explicitly (not in __init__) so users can check the
        data directory exists and is readable before committing to loading.
        """
        self._load_users()
        self._load_movies()
        self._load_ratings()

    def _load_users(self) -> None:
        """Read users.dat and build user objects with ID remapping.

        Format (tab-separated):
          UserID::Gender::Age::Occupation::Zip-code

        We only use UserID; demographics are available but not used in this
        teaching system. Age and occupation could be used for content-based
        features or demographic parity analysis.
        """
        users_file = self.data_dir / "users.dat"
        if not users_file.exists():
            raise FileNotFoundError(f"users.dat not found at {users_file}")

        remapped_idx = 0
        with open(users_file, encoding="latin-1") as f:
            for line in f:
                parts = line.strip().split("::")
                if len(parts) < 1:
                    continue
                movielens_id = int(parts[0])

                # Remap: the user's 0-based index in our system.
                self.user_id_map[movielens_id] = remapped_idx
                self.user_id_reverse[remapped_idx] = movielens_id

                # Create User object with remapped ID.
                user_id = UserId(remapped_idx)
                self.users[user_id] = User(id=user_id)
                remapped_idx += 1

    def _load_movies(self) -> None:
        """Read movies.dat and build movie objects with ID remapping.

        Format (tab-separated):
          MovieID::Title::Genres

        Example: 1::Toy Story (1995)::Animation|Children's|Comedy

        We extract the title and discard genres for this collaborative filtering
        approach (the system learns genre preferences implicitly from ratings).
        """
        movies_file = self.data_dir / "movies.dat"
        if not movies_file.exists():
            raise FileNotFoundError(f"movies.dat not found at {movies_file}")

        remapped_idx = 0
        with open(movies_file, encoding="latin-1") as f:
            for line in f:
                parts = line.strip().split("::")
                if len(parts) < 2:
                    continue
                movielens_id = int(parts[0])
                title = parts[1]

                # Remap: the movie's 0-based index in our system.
                self.movie_id_map[movielens_id] = remapped_idx
                self.movie_id_reverse[remapped_idx] = movielens_id

                # Create Movie object with remapped ID.
                movie_id = MovieId(remapped_idx)
                self.movies[movie_id] = Movie(id=movie_id, title=title)
                remapped_idx += 1

    def _load_ratings(self) -> None:
        """Read ratings.dat and build rating objects.

        Format (tab-separated):
          UserID::MovieID::Rating::Timestamp

        Example: 1::1193::5::978300760

        Ratings are on a 1-5 scale (can be .5 increments, e.g., 3.5).
        Timestamps are Unix epoch and available but ignored in this system.
        """
        ratings_file = self.data_dir / "ratings.dat"
        if not ratings_file.exists():
            raise FileNotFoundError(f"ratings.dat not found at {ratings_file}")

        with open(ratings_file, encoding="latin-1") as f:
            for line in f:
                parts = line.strip().split("::")
                if len(parts) < 3:
                    continue
                movielens_user_id = int(parts[0])
                movielens_movie_id = int(parts[1])
                rating_value = float(parts[2])

                # Look up remapped IDs. If a user or movie isn't in our maps,
                # skip this rating (shouldn't happen with clean data, but defensive).
                if (
                    movielens_user_id not in self.user_id_map
                    or movielens_movie_id not in self.movie_id_map
                ):
                    continue

                remapped_user_id = UserId(self.user_id_map[movielens_user_id])
                remapped_movie_id = MovieId(self.movie_id_map[movielens_movie_id])

                # Create Rating object with remapped IDs.
                self.ratings.append(
                    Rating(
                        user_id=remapped_user_id,
                        movie_id=remapped_movie_id,
                        rating=rating_value,
                    )
                )

    @property
    def num_users(self) -> int:
        """Total number of users (satisfies the DataLoader protocol)."""
        return len(self.users)

    @property
    def num_items(self) -> int:
        """Total number of items/movies (satisfies the DataLoader protocol)."""
        return len(self.movies)

    def stats(self) -> Dict[str, int | float]:
        """Return summary statistics on the loaded dataset.

        Useful for the first notebook (01_explore_the_data.ipynb) to show
        the shape, sparsity, and distribution of the data.
        """
        if not self.ratings:
            raise RuntimeError("No ratings loaded. Call load() first.")

        num_users = len(self.users)
        num_movies = len(self.movies)
        num_ratings = len(self.ratings)
        max_possible_ratings = num_users * num_movies

        # Sparsity: what fraction of the user-movie matrix is filled in?
        # A sparse matrix (< 1% filled) is typical for recommendation systems.
        sparsity = 100.0 * (1 - num_ratings / max_possible_ratings)

        # Average ratings per user and per movie.
        avg_ratings_per_user = num_ratings / num_users
        avg_ratings_per_movie = num_ratings / num_movies

        # Rating distribution.
        rating_values = [r.rating for r in self.ratings]
        min_rating = min(rating_values)
        max_rating = max(rating_values)
        avg_rating = sum(rating_values) / len(rating_values)

        return {
            "num_users": num_users,
            "num_movies": num_movies,
            "num_ratings": num_ratings,
            "max_possible_ratings": max_possible_ratings,
            "sparsity_percent": sparsity,
            "avg_ratings_per_user": avg_ratings_per_user,
            "avg_ratings_per_movie": avg_ratings_per_movie,
            "min_rating": min_rating,
            "max_rating": max_rating,
            "avg_rating": avg_rating,
        }

    def remapped_user_id(self, movielens_id: int) -> UserId:
        """Convert a MovieLens user ID to our internal remapped ID."""
        if movielens_id not in self.user_id_map:
            raise ValueError(f"Unknown MovieLens user ID: {movielens_id}")
        return UserId(self.user_id_map[movielens_id])

    def remapped_movie_id(self, movielens_id: int) -> MovieId:
        """Convert a MovieLens movie ID to our internal remapped ID."""
        if movielens_id not in self.movie_id_map:
            raise ValueError(f"Unknown MovieLens movie ID: {movielens_id}")
        return MovieId(self.movie_id_map[movielens_id])

    def original_user_id(self, remapped_id: int) -> int:
        """Convert our internal remapped user ID back to MovieLens ID."""
        if remapped_id not in self.user_id_reverse:
            raise ValueError(f"Unknown remapped user ID: {remapped_id}")
        return self.user_id_reverse[remapped_id]

    def original_movie_id(self, remapped_id: int) -> int:
        """Convert our internal remapped movie ID back to MovieLens ID."""
        if remapped_id not in self.movie_id_reverse:
            raise ValueError(f"Unknown remapped movie ID: {remapped_id}")
        return self.movie_id_reverse[remapped_id]

    def get_user(self, user_id: UserId) -> User:
        """Look up a user by remapped ID."""
        if user_id not in self.users:
            raise ValueError(f"Unknown user ID: {user_id}")
        return self.users[user_id]

    def get_movie(self, movie_id: MovieId) -> Movie:
        """Look up a movie by remapped ID."""
        if movie_id not in self.movies:
            raise ValueError(f"Unknown movie ID: {movie_id}")
        return self.movies[movie_id]
