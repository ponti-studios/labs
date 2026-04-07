import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '../components/ui/input';
import type { SearchResult, SocialPost } from '../types/vector-search';
import PostItem from './PostItem';

interface SearchResponse {
  results: SearchResult[];
}

export default function VectorSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const { data, isPending, error, refetch } = useQuery<SearchResponse, Error>({
    queryKey: ['vectorSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { results: [] };
      const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      return response.json();
    },
    enabled: !!debouncedQuery.trim(),
  });

  const results = data?.results || [];
  const isSearching = isPending && !!debouncedQuery.trim();
  const errorMessage = error?.message || null;

  const handleUpdatePost = async (postId: string, updates: Partial<SocialPost>) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      refetch(); // Refresh the search query to show updated results
    } catch (err) {
      console.error('Error updating post:', err);
      throw err;
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      refetch(); // Refresh the search query to show updated results
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <Input
          id="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search content..."
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Searching...</span>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{errorMessage}</div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">{results.length} results</div>
          {results.map((result) => (
            <PostItem
              key={result.post.id}
              result={result}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {debouncedQuery && results.length === 0 && !isSearching && !errorMessage && (
        <div className="py-8 text-center text-gray-500">
          <div className="text-sm">No results found</div>
        </div>
      )}
    </div>
  );
}
