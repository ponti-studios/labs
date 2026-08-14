import { flushSync } from "react-dom";

import type { GenerateErr, GenerateOk, GenerateProgressEvent } from "~/lib/realitea/admin/generate-types";

type GenerateStreamEvent =
  | GenerateProgressEvent
  | { type: "result"; result: GenerateOk | GenerateErr };

export async function readGenerateStream(
  body: ReadableStream<Uint8Array>,
  onStage: (event: GenerateProgressEvent) => void,
  onResult: (result: GenerateOk | GenerateErr) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const applyEvents = async (chunk: string, flushRemainder: boolean) => {
    const lines = chunk.split("\n");
    const remainder = flushRemainder ? "" : (lines.pop() ?? "");
    const events = lines
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as GenerateStreamEvent);
    for (const [index, eventPayload] of events.entries()) {
      if (eventPayload.type === "stage") {
        flushSync(() => onStage(eventPayload));
      }
      if (eventPayload.type === "result") {
        flushSync(() => onResult(eventPayload.result));
      }
      if (index < events.length - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 200));
      }
    }
    return remainder;
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    buffer = await applyEvents(buffer, done);
    if (done) break;
  }
}
