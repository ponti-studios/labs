export type PageType = "generic" | "youtube" | "ubereats";

export interface PageContent {
  url: string;
  title: string;
  content: string;
  type: PageType;
  metadata?: Record<string, unknown>;
}

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type ExtensionMessage =
  | { type: "GET_PAGE_CONTENT" }
  | { type: "GET_TABS" }
  | { type: "GET_TAB_CONTENT"; tabId: number };

export type ExtensionResponse =
  | { type: "PAGE_CONTENT_RESPONSE"; payload: PageContent | null }
  | { type: "TABS_RESPONSE"; payload: TabInfo[] }
  | { type: "TAB_CONTENT_RESPONSE"; tabId: number; payload: PageContent | null };

export type ContentScriptMessage = { type: "GET_PAGE_CONTENT" };
