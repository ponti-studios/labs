import type { PuzzleSource } from "../core/types";

export interface ValidationResult {
  normalizedAnswer: string;
  reasons: string[];
  valid: boolean;
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  articleText?: string;
  imageUrl?: string;
}

export interface CandidatePreview {
  candidate: {
    answer: string;
    answerType: string;
    clue: string;
    detail: string;
    sources: PuzzleSource[];
  };
  validation: ValidationResult;
}

export interface GenerationPreviewResult {
  dateKey: string;
  feedUrl: string;
  feedItemCount: number;
  feedItems: FeedItem[];
  candidates: CandidatePreview[];
  selectedIndex: number | null;
  feedError: string | null;
  llmError: string | null;
}

export interface PreviewCandidatesOptions {
  feedUrl?: string;
  feedItems?: FeedItem[];
  systemPrompt?: string;
  excludedAnswers?: string[];
}
