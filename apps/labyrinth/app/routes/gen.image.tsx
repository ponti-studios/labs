import { Accordion } from "@pontistudios/ui";
import { useMemo, useReducer, useState } from "react";

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

export default function GenerativeImageRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [formState, dispatch] = useReducer(generativeImageReducer, initialGenerativeImageFormState);

  const config = useMemo(() => toGenerativeImageConfig(formState), [formState]);
  const promptText = useMemo(() => buildGenerativeImagePrompt(config), [config]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

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
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error("No image URL received from the API.");
      }
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : String(caughtError) || "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
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
            onTogglePrompt={() => setShowPrompt((current) => !current)}
            onGenerate={handleGenerate}
          />
        </main>
      </div>
    </div>
  );
}
