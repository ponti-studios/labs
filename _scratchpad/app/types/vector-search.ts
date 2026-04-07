export interface SocialPost {
  id?: string;
  content: string;
  platform: string;
  date: string;
  engagement?: number;
  author?: string;
  url?: string;
  tags?: string[];
}

export interface SearchResult {
  post: SocialPost;
  score: number;
  similarity: number;
}
