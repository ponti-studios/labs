import type { GenerationUsage } from "../generation/types";

export const GENERATION_PROMPT_FILES = [
  "app/lib/prompts/what-generation.md",
  "app/lib/prompts/what-generation-v2.md",
] as const;

export type GenerateSourceMode = "inventory" | "feeds" | "articles" | "rss" | "fixtures";

export type GenerateReasoningEffort = "default" | "none" | "minimal" | "low" | "medium" | "high";

export const GENERATE_REASONING_EFFORTS: GenerateReasoningEffort[] = [
  "default",
  "none",
  "minimal",
  "low",
  "medium",
  "high",
];

export type GenerateRequest = {
  dateKey: string;
  sourceMode: GenerateSourceMode;
  feedIds?: number[];
  articleIds?: number[];
  feedUrl?: string;
  fixtureId?: string;
  promptSource: "file" | "paste";
  promptPath?: string;
  promptText?: string;
  model?: string;
  compareGroupId?: string;
  maxTokens?: number;
  reasoningEffort?: GenerateReasoningEffort;
};

export type GenerateFeedUrlResult =
  | { ok: true; href: string }
  | { ok: false; code: "INVALID_URL" | "HTTP_NOT_ALLOWED" | "PRIVATE_HOST" | "HOST_NOT_ALLOWED" };

export type GenerateStage = "prepare" | "articles" | "model" | "score" | "done";

export type GenerateProgressEvent = {
  type: "stage";
  stage: GenerateStage;
  label: string;
  detail: string;
};

export type GenerateCandidateView = {
  id: number;
  ordinal: number;
  valid: boolean;
  reasons: string[];
  articleId: number | null;
  articleTitle: string | null;
  articleUrl: string | null;
  candidate: {
    answer: string;
    answerType: string;
    clue: string;
    detail: string;
    sources: Array<{ url: string; title: string; publishedAt: string }>;
  };
};

export type GenerateOk = {
  ok: true;
  generationId: number;
  publishable: boolean;
  model: string;
  promptSource: "file" | "paste";
  selectedIndex: number | null;
  feedError: string | null;
  llmError: string | null;
  articleCount: number;
  candidates: GenerateCandidateView[];
  usage: GenerationUsage;
};

export type GenerateErr = {
  ok: false;
  code:
    | "INVALID_DATE"
    | "INVALID_PROMPT"
    | "INVALID_MODEL"
    | "INVALID_MAX_TOKENS"
    | "RATE_LIMITED"
    | "INVALID_SOURCE"
    | "INVALID_URL"
    | "HTTP_NOT_ALLOWED"
    | "PRIVATE_HOST"
    | "HOST_NOT_ALLOWED";
  error: string;
};
