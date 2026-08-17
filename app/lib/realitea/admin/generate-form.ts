import {
  GENERATE_REASONING_EFFORTS,
  type GenerateReasoningEffort,
  type GenerateRequest,
  type GenerateSourceMode,
} from "./generate-types";

export function readGenerateForm(form: FormData): GenerateRequest {
  const feedIds = String(form.get("feedIds") ?? "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));
  const articleIds = String(form.get("articleIds") ?? "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));
  const maxTokensRaw = Number.parseInt(String(form.get("maxTokens") ?? ""), 10);
  const reasoningEffortRaw = String(form.get("reasoningEffort") ?? "");
  const reasoningEffort = GENERATE_REASONING_EFFORTS.includes(
    reasoningEffortRaw as GenerateReasoningEffort,
  )
    ? (reasoningEffortRaw as GenerateReasoningEffort)
    : undefined;

  return {
    dateKey: String(form.get("dateKey") ?? ""),
    sourceMode: String(form.get("sourceMode") ?? "inventory") as GenerateSourceMode,
    promptSource:
      form.get("promptSource") === "paste" || form.get("promptChoice") === "custom"
        ? "paste"
        : "file",
    ...(form.get("promptPath") ? { promptPath: String(form.get("promptPath")) } : {}),
    ...(form.get("promptText") ? { promptText: String(form.get("promptText")) } : {}),
    ...(form.get("model") ? { model: String(form.get("model")) } : {}),
    ...(form.get("feedUrl") ? { feedUrl: String(form.get("feedUrl")) } : {}),
    ...(form.get("fixtureId") && form.get("fixtureId") !== "none"
      ? { fixtureId: String(form.get("fixtureId")) }
      : {}),
    ...(form.get("compareGroupId") ? { compareGroupId: String(form.get("compareGroupId")) } : {}),
    ...(feedIds.length > 0 ? { feedIds } : {}),
    ...(articleIds.length > 0 ? { articleIds } : {}),
    ...(Number.isInteger(maxTokensRaw) && maxTokensRaw > 0 ? { maxTokens: maxTokensRaw } : {}),
    ...(reasoningEffort ? { reasoningEffort } : {}),
  };
}
