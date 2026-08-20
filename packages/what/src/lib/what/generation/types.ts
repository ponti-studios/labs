import type { GenerateReasonType } from "../admin/generate-copy";
import type { PuzzleSource } from "../core/types";

export interface ValidationResult {
  normalizedAnswer: string;
  reasons: GenerateReasonType[];
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

export interface ScoredCandidate {
  candidate: {
    answer: string;
    answerType: string;
    clue: string;
    detail: string;
    sources: PuzzleSource[];
  };
  validation: ValidationResult;
}

/** Token/cost accounting for one chat completion call. Null fields mean the call never reached the model (e.g. a feed error). */
export interface GenerationUsage {
  requestedMaxTokens: number | null;
  reasoningEffort: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  reasoningTokens: number | null;
  totalTokens: number | null;
  costUsd: number | null;
}

export interface GenerateCandidatesResult {
  dateKey: string;
  feedUrl: string;
  feedItemCount: number;
  feedItems: FeedItem[];
  candidates: ScoredCandidate[];
  selectedIndex: number | null;
  feedError: string | null;
  llmError: string | null;
  usage: GenerationUsage;
}

export interface GenerateCandidatesOptions {
  feedUrl?: string;
  feedItems?: FeedItem[];
  systemPrompt?: string;
  excludedAnswers?: string[];
  model?: string;
  maxTokens?: number;
  reasoningEffort?: string;
}
