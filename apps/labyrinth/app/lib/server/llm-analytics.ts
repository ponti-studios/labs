import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type LlmUsage = {
  completionTokens?: number | null;
  promptTokens?: number | null;
  totalTokens?: number | null;
};

type LlmPrice = {
  amount?: number | null;
  currency?: string | null;
};

type LlmAnalyticsRecord = {
  createdAt: string;
  durationMs?: number | null;
  error?: unknown;
  feature: string;
  httpStatus?: number | null;
  metadata?: Record<string, unknown>;
  model?: string | null;
  operation: string;
  price?: LlmPrice | null;
  provider: string;
  request?: unknown;
  requestId: string;
  response?: unknown;
  status: "error" | "success";
  usage?: LlmUsage | null;
};

type WriteLlmAnalyticsRecordInput = Omit<LlmAnalyticsRecord, "createdAt" | "requestId"> & {
  createdAt?: Date;
  requestId?: string;
};

function getAnalyticsRoot() {
  return process.env.LLM_ANALYTICS_DIR || path.join(process.cwd(), ".artifacts", "llm-analytics");
}

function buildRelativeDirectory(createdAt: Date, feature: string, operation: string) {
  const year = `${createdAt.getUTCFullYear()}`;
  const month = `${createdAt.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${createdAt.getUTCDate()}`.padStart(2, "0");
  return path.join(year, month, day, feature, operation);
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack ?? null,
      ...(typeof (value as Error & { code?: unknown }).code !== "undefined"
        ? { code: (value as Error & { code?: unknown }).code }
        : {}),
      ...(typeof (value as Error & { cause?: unknown }).cause !== "undefined"
        ? { cause: sanitizeValue((value as Error & { cause?: unknown }).cause) }
        : {}),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === "object") {
    const sanitizedEntries = Object.entries(value as Record<string, unknown>).map(
      ([key, nested]) => {
        const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
        const sensitiveKeys = new Set([
          "authorization",
          "apikey",
          "openrouterapikey",
          "secret",
          "accesskeyid",
          "secretaccesskey",
          "accesstoken",
          "refreshtoken",
        ]);

        if (sensitiveKeys.has(normalizedKey)) {
          return [key, "[redacted]"];
        }

        return [key, sanitizeValue(nested)];
      },
    );

    return Object.fromEntries(sanitizedEntries);
  }

  return value;
}

function normalizeUsage(usage: LlmUsage | undefined | null): LlmUsage | null {
  if (!usage) {
    return null;
  }

  return {
    completionTokens: usage.completionTokens ?? null,
    promptTokens: usage.promptTokens ?? null,
    totalTokens: usage.totalTokens ?? null,
  };
}

export async function writeLlmAnalyticsRecord(input: WriteLlmAnalyticsRecordInput) {
  const createdAt = input.createdAt ?? new Date();
  const requestId = input.requestId ?? randomUUID();
  const relativeDirectory = buildRelativeDirectory(createdAt, input.feature, input.operation);
  const analyticsRoot = getAnalyticsRoot();
  const directory = path.join(analyticsRoot, relativeDirectory);
  const timestamp = createdAt.toISOString().replace(/[:.]/g, "-");
  const fileName = `${timestamp}-${requestId}.json`;
  const filePath = path.join(directory, fileName);

  const record: LlmAnalyticsRecord = {
    createdAt: createdAt.toISOString(),
    durationMs: input.durationMs ?? null,
    error: sanitizeValue(input.error),
    feature: input.feature,
    httpStatus: input.httpStatus ?? null,
    metadata: sanitizeValue(input.metadata) as Record<string, unknown> | undefined,
    model: input.model ?? null,
    operation: input.operation,
    price: input.price
      ? {
          amount: input.price.amount ?? null,
          currency: input.price.currency ?? "USD",
        }
      : null,
    provider: input.provider,
    request: sanitizeValue(input.request),
    requestId,
    response: sanitizeValue(input.response),
    status: input.status,
    usage: normalizeUsage(input.usage),
  };

  await mkdir(directory, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");

  return filePath;
}
