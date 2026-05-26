/**
 * Inspired by the take-home exam from Glow Digital.
 *
 * This component allows users to enter a GitHub username and generates a Pokémon-style card with their profile information. It fetches data from the GitHub API and displays the user's avatar, name, bio, followers, following, public repos, location, company, and blog. The card is styled with Tailwind CSS to have a vibrant and modern look.
 * Features:
 * - Input field for GitHub username with validation.
 * - Loading state while fetching data.
 * - Error handling for user not found or fetch failures.
 * - Dynamic styling based on the type of stats (followers, following, repos).
 * - Responsive design with a focus on aesthetics and usability.
 */
import { cn } from "@pontistudios/ui";
import { useState } from "react";

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  company: string | null;
  blog: string | null;
}

export default function GitHubCardRoute() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setUser(null);

    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to fetch user");
      }
      const data: GitHubUser = await res.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const typeColors: Record<string, { bg: string; border: string; text: string }> = {
    followers: { bg: "", border: "border-red-500", text: "text-red-500" },
    following: {
      bg: "",
      border: "border-blue-500",
      text: "text-blue-500",
    },
    repos: {
      bg: "",
      border: "border-green-500",
      text: "text-green-500",
    },
  };

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1>GitHub Pokémon Card</h1>
          <p className="text-slate-400">Enter a GitHub username to generate their card</p>
        </div>

        <form onSubmit={fetchUser} className="flex gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username..."
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="rounded-xl px-6 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {user && (
          <div className="relative group">
            <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700 shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="w-32 h-32 rounded-full border-4 border-slate-700 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 rounded-full px-3 py-1 text-xs font-bold text-slate-900 shadow-lg">
                    #{user.followers}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h2>{user.name || user.login}</h2>
                    <p className="text-orange-400">@{user.login}</p>
                  </div>

                  {user.bio && <p className="text-slate-300 text-sm leading-relaxed">{user.bio}</p>}

                  <div className="flex flex-wrap gap-3">
                    <StatBadge
                      label="Followers"
                      value={user.followers}
                      colors={typeColors.followers}
                    />
                    <StatBadge
                      label="Following"
                      value={user.following}
                      colors={typeColors.following}
                    />
                    <StatBadge label="Repos" value={user.public_repos} colors={typeColors.repos} />
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-400 pt-2">
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <LocationIcon />
                        {user.location}
                      </span>
                    )}
                    {user.company && (
                      <span className="flex items-center gap-1">
                        <BuildingIcon />
                        {user.company}
                      </span>
                    )}
                    {user.blog && (
                      <a
                        href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        <LinkIcon />
                        {user.blog}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <div className="rounded-lg px-3 py-1 shadow-lg">
                  <span className="text-xs font-bold text-slate-900">GITHUB</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Generated on {new Date().toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs">HP</span>
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs">ATK</span>
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs">DEF</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  colors,
}: {
  label: string;
  value: number;
  colors: { bg: string; border: string; text: string };
}) {
  return (
    <div className={cn("rounded-xl px-4 py-2 shadow-lg", colors.bg)}>
      <div className="text-xs font-bold text-white/80 uppercase">{label}</div>
      <div className="text-xl font-bold text-white">{value.toLocaleString()}</div>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}
