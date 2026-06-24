import { OpenRouter } from "@openrouter/sdk";
import { chat } from "@tanstack/ai";
import { createOpenRouterText, openRouterText } from "@tanstack/ai-openrouter";
import { webFetchTool, webSearchTool } from "@tanstack/ai-openrouter/tools";

const DEFAULT_TEXT_MODEL: Parameters<typeof createOpenRouterText>[0] =
  "google/gemini-3.1-flash-lite";
const DEFAULT_IMAGE_MODEL = "x-ai/grok-imagine-image-quality";
const DEFAULT_EMBEDDING_MODEL = "google/gemini-embedding-2";
const DEFAULT_TRANSCRIPTION_MODEL = "mistralai/voxtral-mini-transcribe";

type OpenRouterClientOptions = {
  apiKey?: string;
  httpReferer?: string;
  appTitle?: string;
  appCategories?: string;
};

type ChatRequest = NonNullable<Parameters<OpenRouter["chat"]["send"]>[0]["chatRequest"]>;

type ChatCompletionOptions = OpenRouterClientOptions & {
  messages: ChatRequest["messages"];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: ChatRequest["responseFormat"];
  tools?: ChatRequest["tools"];
};

type ImageGenerationOptions = OpenRouterClientOptions & {
  aspectRatio?: string;
  background?: string;
  moderation?: string;
  outputCompression?: number;
  outputFormat?: string;
  partialImages?: number;
  quality?: string;
  size?: string;
};

type TranscriptionOptions = OpenRouterClientOptions & {
  language?: string;
};

type EmbeddingOptions = OpenRouterClientOptions & {
  inputType?: string;
  dimensions?: number;
};

function resolveOpenRouterApiKey(apiKey?: string) {
  const resolvedApiKey = apiKey ?? process.env.OPENROUTER_API_KEY;

  if (!resolvedApiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

  return resolvedApiKey;
}

export function createOpenRouterClient(options: OpenRouterClientOptions = {}) {
  return new OpenRouter({
    apiKey: resolveOpenRouterApiKey(options.apiKey),
    httpReferer: options.httpReferer,
    appTitle: options.appTitle,
    appCategories: options.appCategories,
  });
}

export function createOpenRouterTextAdapter(options: OpenRouterClientOptions = {}) {
  const apiKey = resolveOpenRouterApiKey(options.apiKey);
  return createOpenRouterText(DEFAULT_TEXT_MODEL, apiKey, {
    httpReferer: options.httpReferer,
    appTitle: options.appTitle,
    appCategories: options.appCategories,
  });
}

export { chat, openRouterText, webFetchTool, webSearchTool };

/** Send a chat completion using the default text model. No programmatic model override is allowed. */
export async function chatCompletion(options: ChatCompletionOptions = { messages: [] }) {
  const {
    apiKey,
    httpReferer,
    appTitle,
    appCategories,
    messages,
    maxTokens,
    temperature,
    responseFormat,
    tools,
  } = options;
  const client = createOpenRouterClient({ apiKey, httpReferer, appTitle, appCategories });
  return client.chat.send({
    httpReferer,
    appTitle,
    appCategories,
    chatRequest: {
      model: DEFAULT_TEXT_MODEL,
      stream: false,
      messages,
      ...(maxTokens !== undefined ? { maxTokens } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
      ...(responseFormat !== undefined ? { responseFormat } : {}),
      ...(tools !== undefined ? { tools } : {}),
    },
  });
}

export async function generateEmbedding(content: string, options: EmbeddingOptions = {}) {
  const client = createOpenRouterClient(options);
  const response = await client.embeddings.generate({
    httpReferer: options.httpReferer,
    appTitle: options.appTitle,
    appCategories: options.appCategories,
    requestBody: {
      model: DEFAULT_EMBEDDING_MODEL,
      input: content,
      inputType: options.inputType ?? "search_document",
      dimensions: options.dimensions,
      encodingFormat: "float",
    },
  });

  const embeddingResponse = typeof response === "string" ? JSON.parse(response) : response;
  const embedding = embeddingResponse.data[0]?.embedding;

  return Array.isArray(embedding) ? embedding : [];
}

function toAudioFormat(mimeType: string) {
  if (mimeType.includes("webm")) {
    return "webm";
  }

  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) {
    return "mp3";
  }

  if (mimeType.includes("wav")) {
    return "wav";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  if (mimeType.includes("aac")) {
    return "aac";
  }

  if (mimeType.includes("flac")) {
    return "flac";
  }

  return mimeType;
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string,
  options: TranscriptionOptions = {},
) {
  const client = createOpenRouterClient(options);
  const response = await client.stt.createTranscription({
    httpReferer: options.httpReferer,
    appTitle: options.appTitle,
    appCategories: options.appCategories,
    sttRequest: {
      model: DEFAULT_TRANSCRIPTION_MODEL,
      inputAudio: {
        data: audioBase64,
        format: toAudioFormat(mimeType),
      },
      language: options.language,
    },
  });

  return response.text;
}

export async function generateImageFromPrompt(
  prompt: string,
  options: ImageGenerationOptions = {},
) {
  const client = createOpenRouterClient(options);
  const imageConfig: Record<string, string | number> = {};

  if (options.aspectRatio) {
    imageConfig.aspect_ratio = options.aspectRatio;
  }

  if (options.background) {
    imageConfig.background = options.background;
  }

  if (options.moderation) {
    imageConfig.moderation = options.moderation;
  }

  if (options.outputCompression !== undefined) {
    imageConfig.output_compression = options.outputCompression;
  }

  if (options.outputFormat) {
    imageConfig.output_format = options.outputFormat;
  }

  if (options.partialImages !== undefined) {
    imageConfig.partial_images = options.partialImages;
  }

  if (options.quality) {
    imageConfig.quality = options.quality;
  }

  if (options.size) {
    imageConfig.size = options.size;
  }

  const response = await client.chat.send({
    httpReferer: options.httpReferer,
    appTitle: options.appTitle,
    appCategories: options.appCategories,
    chatRequest: {
      model: DEFAULT_IMAGE_MODEL,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image"],
      stream: false,
      ...(Object.keys(imageConfig).length > 0 ? { imageConfig } : {}),
    },
  });

  const imageUrl = response.choices?.[0]?.message.images?.[0]?.imageUrl.url;

  if (imageUrl) {
    return imageUrl;
  }

  const content = response.choices?.[0]?.message.content;

  if (
    typeof content === "string" &&
    (content.startsWith("data:image/") || content.startsWith("http"))
  ) {
    return content;
  }

  const imageItem = Array.isArray(content)
    ? (
        content as Array<{
          type?: string;
          imageUrl?: { url?: string };
          image_url?: { url?: string };
          url?: string;
        }>
      ).find((item) => item.type === "image_url" || item.imageUrl || item.image_url || item.url)
    : null;

  const contentImageUrl = imageItem?.imageUrl?.url ?? imageItem?.image_url?.url ?? imageItem?.url;

  if (contentImageUrl) {
    return contentImageUrl;
  }

  throw new Error("No image data received from OpenRouter");
}

export {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_TEXT_MODEL,
  DEFAULT_TRANSCRIPTION_MODEL,
};
