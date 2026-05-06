type OllamaRole = 'system' | 'user' | 'assistant';

type OllamaMessage = {
  role: OllamaRole;
  content: string;
  images?: string[];
};

type ChatSession = {
  sendMessage: (input: { message: string; images?: string[] }) => Promise<{ text: string }>;
  reset: () => void;
};

const OLLAMA_BASE_URL = getEnv('VITE_OLLAMA_BASE_URL', 'http://localhost:11434');
const DEFAULT_CHAT_MODEL = getEnv('VITE_OLLAMA_CHAT_MODEL', 'llama3.1');
const DEFAULT_VISION_MODEL = getEnv('VITE_OLLAMA_VISION_MODEL', 'llama3.2-vision');
const DEFAULT_INTENT_MODEL = getEnv('VITE_OLLAMA_INTENT_MODEL', DEFAULT_CHAT_MODEL);
const DEFAULT_TRANSCRIBE_MODEL = getEnv('VITE_OLLAMA_TRANSCRIBE_MODEL', '');
const DEFAULT_TTS_MODEL = getEnv('VITE_OLLAMA_TTS_MODEL', '');

function getEnv(name: string, fallback: string) {
  const value = import.meta.env[name as keyof ImportMetaEnv];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function buildUrl(path: string) {
  const baseUrl = OLLAMA_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function stripDataUrl(value: string) {
  const commaIndex = value.indexOf(',');
  return commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

function responseToText(data: any) {
  return String(data?.message?.content ?? data?.response ?? data?.text ?? '').trim();
}

async function requestChat(
  model: string,
  messages: OllamaMessage[],
  options?: Record<string, unknown>,
  format?: 'json' | Record<string, unknown>,
) {
  const response = await fetch(buildUrl('/api/chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      ...(format ? { format } : {}),
      ...(options ? { options } : {}),
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Ollama chat request failed (${response.status}): ${raw || response.statusText}`);
  }

  const data = safeJsonParse<Record<string, unknown>>(raw) ?? {};
  const content = responseToText(data);

  if (!content) {
    throw new Error('Ollama returned an empty response.');
  }

  return content;
}

function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function base64ToBlob(base64Data: string, mimeType: string) {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

async function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

// Multi-turn chat
export async function startChat(systemInstruction: string): Promise<ChatSession> {
  const history: OllamaMessage[] = systemInstruction
    ? [{ role: 'system', content: systemInstruction }]
    : [];

  return {
    async sendMessage({ message, images }) {
      history.push({
        role: 'user',
        content: message,
        ...(images?.length ? { images } : {}),
      });

      const text = await requestChat(DEFAULT_CHAT_MODEL, history, {
        temperature: 0.7,
      });

      history.push({ role: 'assistant', content: text });
      return { text };
    },
    reset() {
      history.length = systemInstruction ? 1 : 0;
    },
  };
}

// Intent detection (Fast)
export async function detectIntent(text: string) {
  if (!text || text.length < 3) return null;

  try {
    const response = await requestChat(
      DEFAULT_INTENT_MODEL,
      [
        {
          role: 'system',
          content: [
            'You are an intent detection classifier for a UI assistant.',
            'Return only valid JSON with the shape:',
            '{"type":"reminder|summary|search|task|none","label":"short UI label","confidence":0-1}',
            'Use type "none" and a low confidence when the input does not suggest a clear action.',
          ].join(' '),
        },
        { role: 'user', content: text },
      ],
      { temperature: 0 },
      'json',
    );

    const result = safeJsonParse<{ type?: string; label?: string; confidence?: number | string }>(response);
    const confidence = Number(result?.confidence);

    if (Number.isFinite(confidence) && confidence > 0.6 && result?.type !== 'none') {
      return {
        type: result?.type ?? 'none',
        label: result?.label ?? 'Suggested action',
        confidence,
      };
    }
  } catch (error) {
    console.error('Intent detection failed:', error);
  }

  return null;
}

// Image analysis
export async function analyzeImage(
  base64Image: string,
  prompt: string = "What is this? If it's a document, extract key text. If it's an object, identify it. Return a short summary.",
) {
  try {
    const response = await requestChat(
      DEFAULT_VISION_MODEL,
      [
        {
          role: 'user',
          content: prompt,
          images: [stripDataUrl(base64Image)],
        },
      ],
      { temperature: 0.2 },
    );

    return response;
  } catch (error) {
    console.error('Image processing failed:', error);
  }

  return null;
}

// Audio transcription
export async function transcribeAudio(base64Audio: string) {
  if (!DEFAULT_TRANSCRIBE_MODEL) {
    console.warn('No Ollama transcription model configured. Set VITE_OLLAMA_TRANSCRIBE_MODEL to a compatible model.');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', base64ToBlob(base64Audio, 'audio/wav'), 'recording.wav');
    formData.append('model', DEFAULT_TRANSCRIBE_MODEL);

    const response = await fetch(buildUrl('/v1/audio/transcriptions'), {
      method: 'POST',
      body: formData,
    });

    const raw = await response.text();

    if (!response.ok) {
      throw new Error(`Ollama transcription failed (${response.status}): ${raw || response.statusText}`);
    }

    const data = safeJsonParse<{ text?: string; transcription?: string }>(raw);
    const text = data?.text ?? data?.transcription ?? raw.trim();
    return text || null;
  } catch (error) {
    console.error('Transcription failed:', error);
  }

  return null;
}

// Text to Speech (TTS)
export async function generateSpeech(text: string) {
  if (DEFAULT_TTS_MODEL) {
    try {
      const response = await fetch(buildUrl('/v1/audio/speech'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_TTS_MODEL,
          input: text,
        }),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        if (audioBuffer.byteLength > 0) {
          return await arrayBufferToBase64(audioBuffer);
        }
      } else {
        const raw = await response.text();
        throw new Error(`Ollama TTS failed (${response.status}): ${raw || response.statusText}`);
      }
    } catch (error) {
      console.error('TTS failed:', error);
    }
  }

  speakText(text);
  return null;
}

// Search grounding
export async function searchGrounding(query: string) {
  try {
    return await requestChat(
      DEFAULT_CHAT_MODEL,
      [
        {
          role: 'system',
          content: 'You are a helpful research assistant. Answer the user directly. If the question needs live web access, say you cannot browse the web and provide the best offline answer you can.',
        },
        { role: 'user', content: query },
      ],
      { temperature: 0.2 },
    );
  } catch (error) {
    console.error('Search grounding failed:', error);
  }

  return null;
}
