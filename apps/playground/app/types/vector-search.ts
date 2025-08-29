export interface SocialPost {
	id?: string;
	content: string;
	platform: string;
	date: string;
	completed?: number;
	project?: string;
	url?: string;
	tags?: string[];
	start?: string;
	end?: string;
	projectId?: number;
}

export interface SearchResult {
	post: SocialPost;
	score: number;
	similarity: number;
}
