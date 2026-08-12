import type { PreviewRequest, PreviewSourceMode } from "./preview";

export function readPreviewForm(form: FormData): PreviewRequest {
  const feedIds = String(form.get("feedIds") ?? "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));
  const articleIds = String(form.get("articleIds") ?? "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));

  return {
    dateKey: String(form.get("dateKey") ?? ""),
    sourceMode: String(form.get("sourceMode") ?? "inventory") as PreviewSourceMode,
    promptSource: form.get("promptSource") === "paste" ? "paste" : "file",
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
  };
}
