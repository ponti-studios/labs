import { Button } from "@ponti-studios/ui/primitives";
import { AlertCircle, Code, Download, Sparkles } from "lucide-react";

type GenerativeImagePreviewPanelProps = {
  generatedImage: string | null;
  loading: boolean;
  error: string | null;
  showPrompt: boolean;
  promptText: string;
  onTogglePrompt: () => void;
  onGenerate: () => void;
};

export function GenerativeImagePreviewPanel({
  generatedImage,
  loading,
  error,
  showPrompt,
  promptText,
  onTogglePrompt,
  onGenerate,
}: GenerativeImagePreviewPanelProps) {
  return (
    <div className="flex h-[calc(100vh-220px)] flex-col lg:col-span-7">
      <header className="border-default mb-6 flex items-center justify-between border-b pb-6">
        <h1 className="mt-1">Parametric Image Generation</h1>
        <button
          type="button"
          onClick={onTogglePrompt}
          className="text-secondary hover:text-primary flex items-center gap-2 text-sm transition-colors"
        >
          <Code size={16} />
          {showPrompt ? "Hide prompt" : "Show prompt"}
        </button>
      </header>

      <div className="group border-default bg-inset relative flex grow items-center justify-center overflow-hidden rounded border">
        {generatedImage ? (
          <img
            src={generatedImage}
            alt="Generated result"
            className="h-full w-full rounded object-contain"
          />
        ) : (
          <div className="p-8 text-center">
            <div className="border-default bg-canvas mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border">
              <Sparkles className="text-secondary" size={32} />
            </div>
            <h3>Ready to Imagine</h3>
            <p className="text-secondary mx-auto mt-2 max-w-sm">
              Configure your parameters on the left and hit generate to create a high-fidelity
              image.
            </p>
          </div>
        )}

        {generatedImage && !loading ? (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => {
                const link = document.createElement("a");
                link.href = generatedImage;
                link.download = `generative-image-export-${Date.now()}.png`;
                link.click();
              }}
              className="border-default bg-canvas/80 text-primary hover:bg-canvas rounded border p-2 backdrop-blur transition-colors"
              title="Download"
            >
              <Download size={18} />
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="border-destructive/20 bg-destructive/5 text-destructive mt-4 flex items-center gap-3 border px-4 py-3 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {showPrompt ? (
        <div className="border-default bg-inset mt-4 h-48 overflow-y-auto rounded border p-4">
          <pre className="text-primary font-mono text-xs">{promptText}</pre>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button onClick={onGenerate} disabled={loading}>
          <Sparkles size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : "Generate Scene"}
        </Button>
      </div>
    </div>
  );
}
