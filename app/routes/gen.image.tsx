import { Accordion } from "@ponti-studios/ui/data-display";
import { useMemo, useReducer } from "react";

import { GenerativeImagePreviewPanel } from "~/components/generative-image/preview-panel";
import {
  generativeImageReducer,
  initialGenerativeImageFormState,
  toGenerativeImageConfig,
  buildGenerativeImagePrompt,
} from "~/components/generative-image/state";
import {
  AttireSection,
  EnvironmentSection,
  ImageSpecificationsSection,
  LightingSection,
  SubjectSection,
  VisualStyleSection,
} from "~/components/generative-image/sections";

export function meta() {
  return [
    { title: "Generative Image Console" },
    {
      name: "description",
      content: "Parametric image generation with fine-grained controls.",
    },
  ];
}

type GenState = {
  loading: boolean;
  error: string | null;
  generatedImage: string | null;
  showPrompt: boolean;
};

type GenAction =
  | { type: "generate/start" }
  | { type: "generate/success"; imageUrl: string }
  | { type: "generate/error"; message: string }
  | { type: "toggle_prompt" };

function genReducer(state: GenState, action: GenAction): GenState {
  switch (action.type) {
    case "generate/start":
      return { ...state, loading: true, error: null };
    case "generate/success":
      return { ...state, loading: false, generatedImage: action.imageUrl };
    case "generate/error":
      return { ...state, loading: false, error: action.message };
    case "toggle_prompt":
      return { ...state, showPrompt: !state.showPrompt };
  }
}

const initialGenState: GenState = {
  loading: false,
  error: null,
  generatedImage: null,
  showPrompt: false,
};

export default function GenerativeImageRoute() {
  const [{ loading, error, generatedImage, showPrompt }, genDispatch] = useReducer(
    genReducer,
    initialGenState,
  );
  const [formState, dispatch] = useReducer(generativeImageReducer, initialGenerativeImageFormState);

  const config = useMemo(() => toGenerativeImageConfig(formState), [formState]);
  const promptText = useMemo(() => buildGenerativeImagePrompt(config), [config]);

  const handleGenerate = async () => {
    genDispatch({ type: "generate/start" });

    try {
      const response = await fetch("/api/gen/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `Generation failed: ${response.statusText}`);
      }

      const data = (await response.json()) as { imageUrl?: string };

      if (data.imageUrl) {
        genDispatch({ type: "generate/success", imageUrl: data.imageUrl });
      } else {
        throw new Error("No image URL received from the API.");
      }
    } catch (caughtError: unknown) {
      genDispatch({
        type: "generate/error",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : String(caughtError) || "An unexpected error occurred",
      });
    }
  };

  return (
    <div className="p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="h-[calc(100vh-220px)] overflow-y-auto pr-1 lg:col-span-5">
            <Accordion type="multiple" defaultValue={["image-specs"]} className="w-full">
              <ImageSpecificationsSection
                config={formState.image_specifications}
                dispatch={dispatch}
              />
              <SubjectSection config={formState.subject} dispatch={dispatch} />
              <AttireSection config={formState.attire} dispatch={dispatch} />
              <EnvironmentSection config={formState.environment} dispatch={dispatch} />
              <LightingSection config={formState.lighting} dispatch={dispatch} />
              <VisualStyleSection config={formState.visual_style} dispatch={dispatch} />
            </Accordion>
          </div>

          <GenerativeImagePreviewPanel
            generatedImage={generatedImage}
            loading={loading}
            error={error}
            showPrompt={showPrompt}
            promptText={promptText}
            onTogglePrompt={() => genDispatch({ type: "toggle_prompt" })}
            onGenerate={handleGenerate}
          />
        </main>
      </div>
    </div>
  );
}
