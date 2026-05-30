export interface VoiceTaskResult {
  title: string;
  estimatedMinutes: number;
  tags: string[];
}

export async function processVoiceTask(
  audioBase64: string,
  mimeType: string,
  existingTags: string[],
): Promise<VoiceTaskResult | null> {
  const response = await fetch("/api/voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, mimeType, existingTags }),
  });

  if (!response.ok) {
    throw new Error("Voice processing failed");
  }

  return (await response.json()) as VoiceTaskResult | null;
}
