import { OpenRouter } from "@openrouter/sdk";
import { chat } from "@tanstack/ai";
import { createOpenRouterText, openRouterText } from "@tanstack/ai-openrouter";
import { webFetchTool, webSearchTool } from "@tanstack/ai-openrouter/tools";

const DEFAULT_TEXT_MODEL: Parameters<typeof createOpenRouterText>[0] = "openai/gpt-5.1";
const DEFAULT_IMAGE_MODEL = "x-ai/grok-imagine-image-quality";
const DEFAULT_EMBEDDING_MODEL = "google/gemini-embedding-2";
const DEFAULT_TRANSCRIPTION_MODEL = "mistralai/voxtral-mini-transcribe";

type OpenRouterClientOptions = {
  apiKey?: string;
  httpReferer?: string;
  appTitle?: string;
  appCategories?: string;
};

type OpenRouterTextAdapterOptions = OpenRouterClientOptions & {
  model?: Parameters<typeof createOpenRouterText>[0];
};

type ImageGenerationOptions = OpenRouterClientOptions & {
  model?: string;
  imageModel?: string;
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
  model?: string;
  language?: string;
};

type EmbeddingOptions = OpenRouterClientOptions & {
  model?: string;
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

export function createOpenRouterTextAdapter(options: OpenRouterTextAdapterOptions = {}) {
  const apiKey = resolveOpenRouterApiKey(options.apiKey);
  return createOpenRouterText(options.model ?? DEFAULT_TEXT_MODEL, apiKey, {
    httpReferer: options.httpReferer,
    appTitle: options.appTitle,
    appCategories: options.appCategories,
  });
}

export { chat, openRouterText, webFetchTool, webSearchTool };

export async function generateEmbedding(content: string, options: EmbeddingOptions = {}) {
  const client = createOpenRouterClient(options);
  const response = await client.embeddings.generate({
    httpReferer: options.httpReferer,
    appTitle: options.appTitle,
    appCategories: options.appCategories,
    requestBody: {
      model: options.model ?? DEFAULT_EMBEDDING_MODEL,
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
      model: options.model ?? DEFAULT_TRANSCRIPTION_MODEL,
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
  const additionalProperties: Record<string, string | number> = {};

  if (options.aspectRatio) {
    additionalProperties.aspect_ratio = options.aspectRatio;
  }

  if (options.background) {
    additionalProperties.background = options.background;
  }

  if (options.moderation) {
    additionalProperties.moderation = options.moderation;
  }

  if (options.outputCompression !== undefined) {
    additionalProperties.output_compression = options.outputCompression;
  }

  if (options.outputFormat) {
    additionalProperties.output_format = options.outputFormat;
  }

  if (options.partialImages !== undefined) {
    additionalProperties.partial_images = options.partialImages;
  }

  if (options.quality) {
    additionalProperties.quality = options.quality;
  }

  if (options.size) {
    additionalProperties.size = options.size;
  }

  const response = await client.beta.responses.send({
    responsesRequest: {
      model: options.model ?? DEFAULT_TEXT_MODEL,
      input: prompt,
      modalities: ["image"],
      tools: [
        {
          type: "openrouter:image_generation",
          parameters: {
            model: options.imageModel ?? DEFAULT_IMAGE_MODEL,
            ...(Object.keys(additionalProperties).length > 0 ? { additionalProperties } : {}),
          },
        },
      ],
    },
  });

  const imageItem = (
    response.output as Array<{
      type: string;
      imageB64?: string;
      imageUrl?: string;
      result?: string | null;
    }>
  ).find((item) => item.type === "openrouter:image_generation");

  if (!imageItem) {
    throw new Error("No image data received from OpenRouter");
  }

  if (imageItem.imageB64) {
    return `data:image/png;base64,${imageItem.imageB64}`;
  }

  if (imageItem.imageUrl) {
    return imageItem.imageUrl;
  }

  if (imageItem.result) {
    return imageItem.result;
  }

  throw new Error("No image data received from OpenRouter");
}

export {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_TEXT_MODEL,
  DEFAULT_TRANSCRIPTION_MODEL,
};
