import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@pontistudios/ui";
import {
  AlertCircle,
  Camera,
  Code,
  Download,
  MapPin,
  Palette,
  Shirt,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import type { ComponentType, Dispatch, ReactNode } from "react";
import { memo, useReducer, useState } from "react";

export function meta() {
  return [
    { title: "Director's Console" },
    { name: "description", content: "Parametric image generation with fine-grained controls." },
  ];
}

interface Config {
  image_specifications: {
    format: string;
    dimensions: string;
    aesthetic: string[];
  };
  subject: {
    pose: string;
    expression: string;
    skin_rendering: string;
    editing_constraint: string;
  };
  attire: {
    top: string;
    bottom: string;
  };
  environment: {
    setting: string;
    primary_prop: string;
    background: {
      visibility: string;
      bokeh: string;
      ambient_elements: string;
    };
  };
  lighting: {
    type: string;
    effects: string[];
  };
  visual_style: {
    color_palette: string;
    texture: string;
    lens_characteristics: string;
  };
}

const initialConfig: Config = {
  image_specifications: {
    format: "35mm Analog Film Photography",
    dimensions: "1200x1200px",
    aesthetic: ["Raw", "Nostalgic", "Gritty", "Candid Street Portrait"],
  },
  subject: {
    pose: "Leaning against vehicle, arms folded across chest",
    expression: "Slight smile looking at camera",
    skin_rendering: "Natural texture with slight glow from flash",
    editing_constraint: "Face unaltered",
  },
  attire: {
    top: "Army green tank top with ribbon ties",
    bottom: "Black flared pants",
  },
  environment: {
    setting: "Night city street",
    primary_prop: "Red Ferrari F8",
    background: {
      visibility: "Dark with minimal noise",
      bokeh: "Soft bokeh",
      ambient_elements: "Blurred and slightly halated streetlights, car headlights, or neon signs",
    },
  },
  lighting: {
    type: "Direct camera flash",
    effects: [
      "Strong highlights on face and body",
      "Sharp shadows behind subject",
      "High contrast",
    ],
  },
  visual_style: {
    color_palette: "Muted and slightly warm",
    texture: "Subtle but distinct film grain throughout",
    lens_characteristics: "Analog 35mm lens style",
  },
};

type InputGroupProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "textarea";
  help?: string;
};

function InputGroup({ label, value, onChange, type = "text", help }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="ui-eyebrow">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-20 w-full resize-none rounded border border-border bg-background p-2 text-sm text-foreground outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-ring"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-border bg-background p-2 text-sm text-foreground outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-ring"
        />
      )}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

function buildPrompt(config: Config) {
  return `Generate a photorealistic image based on these strict specifications:\n${JSON.stringify(config, null, 2)}`;
}

const parseCommaSeparatedValues = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type ConfigAction =
  | {
      type: "image_specifications/update";
      key: keyof Config["image_specifications"];
      value: string | string[];
    }
  | { type: "subject/update"; key: keyof Config["subject"]; value: string }
  | { type: "attire/update"; key: keyof Config["attire"]; value: string }
  | {
      type: "environment/update";
      key: Exclude<keyof Config["environment"], "background">;
      value: string;
    }
  | {
      type: "environment/background/update";
      key: keyof Config["environment"]["background"];
      value: string;
    }
  | { type: "lighting/update"; key: keyof Config["lighting"]; value: string | string[] }
  | { type: "visual_style/update"; key: keyof Config["visual_style"]; value: string };

function configReducer(state: Config, action: ConfigAction): Config {
  switch (action.type) {
    case "image_specifications/update":
      return {
        ...state,
        image_specifications: { ...state.image_specifications, [action.key]: action.value },
      };
    case "subject/update":
      return { ...state, subject: { ...state.subject, [action.key]: action.value } };
    case "attire/update":
      return { ...state, attire: { ...state.attire, [action.key]: action.value } };
    case "environment/update":
      return {
        ...state,
        environment: {
          ...state.environment,
          [action.key]: action.value as Config["environment"][keyof Config["environment"]],
        },
      };
    case "environment/background/update":
      return {
        ...state,
        environment: {
          ...state.environment,
          background: { ...state.environment.background, [action.key]: action.value },
        },
      };
    case "lighting/update":
      return { ...state, lighting: { ...state.lighting, [action.key]: action.value } };
    case "visual_style/update":
      return { ...state, visual_style: { ...state.visual_style, [action.key]: action.value } };
    default:
      return state;
  }
}

type SectionDispatch = Dispatch<ConfigAction>;

type SectionPanelProps = {
  value: string;
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
};

function SectionPanel({ value, title, icon: Icon, children }: SectionPanelProps) {
  return (
    <AccordionItem value={value} className="border-b border-border">
      <AccordionTrigger className="py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon size={16} className="text-muted-foreground" />
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pb-2 pt-1">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

const ImageSpecificationsSection = memo(function ImageSpecificationsSection({
  config,
  dispatch,
}: {
  config: Config["image_specifications"];
  dispatch: SectionDispatch;
}) {
  return (
    <SectionPanel value="image-specs" title="Image Specifications" icon={Camera}>
      <InputGroup
        label="Format"
        value={config.format}
        onChange={(value) =>
          dispatch({ type: "image_specifications/update", key: "format", value })
        }
      />
      <InputGroup
        label="Dimensions"
        value={config.dimensions}
        onChange={(value) =>
          dispatch({ type: "image_specifications/update", key: "dimensions", value })
        }
      />
      <InputGroup
        label="Aesthetic (comma-separated)"
        value={config.aesthetic.join(", ")}
        onChange={(value) =>
          dispatch({
            type: "image_specifications/update",
            key: "aesthetic",
            value: parseCommaSeparatedValues(value),
          })
        }
        type="textarea"
      />
    </SectionPanel>
  );
});

const SubjectSection = memo(function SubjectSection({
  config,
  dispatch,
}: {
  config: Config["subject"];
  dispatch: SectionDispatch;
}) {
  return (
    <SectionPanel value="subject" title="Subject Details" icon={User}>
      <InputGroup
        label="Pose"
        value={config.pose}
        onChange={(value) => dispatch({ type: "subject/update", key: "pose", value })}
      />
      <InputGroup
        label="Expression"
        value={config.expression}
        onChange={(value) => dispatch({ type: "subject/update", key: "expression", value })}
      />
      <InputGroup
        label="Skin Rendering"
        value={config.skin_rendering}
        onChange={(value) => dispatch({ type: "subject/update", key: "skin_rendering", value })}
      />
    </SectionPanel>
  );
});

const AttireSection = memo(function AttireSection({
  config,
  dispatch,
}: {
  config: Config["attire"];
  dispatch: SectionDispatch;
}) {
  return (
    <SectionPanel value="attire" title="Attire" icon={Shirt}>
      <InputGroup
        label="Top"
        value={config.top}
        onChange={(value) => dispatch({ type: "attire/update", key: "top", value })}
      />
      <InputGroup
        label="Bottom"
        value={config.bottom}
        onChange={(value) => dispatch({ type: "attire/update", key: "bottom", value })}
      />
    </SectionPanel>
  );
});

const EnvironmentSection = memo(function EnvironmentSection({
  config,
  dispatch,
}: {
  config: Config["environment"];
  dispatch: SectionDispatch;
}) {
  return (
    <SectionPanel value="environment" title="Environment" icon={MapPin}>
      <InputGroup
        label="Setting"
        value={config.setting}
        onChange={(value) => dispatch({ type: "environment/update", key: "setting", value })}
      />
      <InputGroup
        label="Primary Prop"
        value={config.primary_prop}
        onChange={(value) => dispatch({ type: "environment/update", key: "primary_prop", value })}
      />
      <div className="border-t border-border pt-3">
        <p className="ui-eyebrow mb-3">Background</p>
        <div className="space-y-4">
          <InputGroup
            label="Visibility"
            value={config.background.visibility}
            onChange={(value) =>
              dispatch({ type: "environment/background/update", key: "visibility", value })
            }
          />
          <InputGroup
            label="Ambient Elements"
            value={config.background.ambient_elements}
            onChange={(value) =>
              dispatch({ type: "environment/background/update", key: "ambient_elements", value })
            }
            type="textarea"
          />
        </div>
      </div>
    </SectionPanel>
  );
});

const LightingSection = memo(function LightingSection({
  config,
  dispatch,
}: {
  config: Config["lighting"];
  dispatch: SectionDispatch;
}) {
  return (
    <SectionPanel value="lighting" title="Lighting" icon={Zap}>
      <InputGroup
        label="Type"
        value={config.type}
        onChange={(value) => dispatch({ type: "lighting/update", key: "type", value })}
      />
      <InputGroup
        label="Effects (comma-separated)"
        value={config.effects.join(", ")}
        onChange={(value) =>
          dispatch({
            type: "lighting/update",
            key: "effects",
            value: parseCommaSeparatedValues(value),
          })
        }
        type="textarea"
      />
    </SectionPanel>
  );
});

const VisualStyleSection = memo(function VisualStyleSection({
  config,
  dispatch,
}: {
  config: Config["visual_style"];
  dispatch: SectionDispatch;
}) {
  return (
    <SectionPanel value="visual-style" title="Visual Style" icon={Palette}>
      <InputGroup
        label="Color Palette"
        value={config.color_palette}
        onChange={(value) => dispatch({ type: "visual_style/update", key: "color_palette", value })}
      />
      <InputGroup
        label="Texture"
        value={config.texture}
        onChange={(value) => dispatch({ type: "visual_style/update", key: "texture", value })}
      />
      <InputGroup
        label="Lens Characteristics"
        value={config.lens_characteristics}
        onChange={(value) =>
          dispatch({ type: "visual_style/update", key: "lens_characteristics", value })
        }
      />
    </SectionPanel>
  );
});

export default function DirectorRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [config, dispatch] = useReducer(configReducer, initialConfig);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/director/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `Generation failed: ${response.statusText}`);
      }

      const data = (await response.json()) as { imageData?: string };

      if (data.imageData) {
        setGeneratedImage(data.imageData);
      } else {
        throw new Error("No image data received from the API.");
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
        <header className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <p className="ui-eyebrow">Director&apos;s Console</p>
            <h1 className="mt-1">Parametric Image Generation</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowPrompt((c) => !c)}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Code size={16} />
            {showPrompt ? "Hide prompt" : "Show prompt"}
          </button>
        </header>

        <main className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="h-[calc(100vh-220px)] overflow-y-auto pr-1 lg:col-span-5">
            <Accordion type="multiple" defaultValue={["image-specs"]} className="w-full">
              <ImageSpecificationsSection
                config={config.image_specifications}
                dispatch={dispatch}
              />
              <SubjectSection config={config.subject} dispatch={dispatch} />
              <AttireSection config={config.attire} dispatch={dispatch} />
              <EnvironmentSection config={config.environment} dispatch={dispatch} />
              <LightingSection config={config.lighting} dispatch={dispatch} />
              <VisualStyleSection config={config.visual_style} dispatch={dispatch} />
            </Accordion>
          </div>

          <div className="flex h-[calc(100vh-220px)] flex-col lg:col-span-7">
            <div className="group relative flex grow items-center justify-center overflow-hidden rounded border border-border bg-muted">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated result"
                  className="h-full w-full rounded object-contain"
                />
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-background">
                    <Sparkles className="text-muted-foreground" size={32} />
                  </div>
                  <h3>Ready to Imagine</h3>
                  <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                    Configure your parameters on the left and hit generate to create a high-fidelity
                    image.
                  </p>
                </div>
              )}

              {generatedImage && !loading && (
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = generatedImage;
                      link.download = `director-export-${Date.now()}.png`;
                      link.click();
                    }}
                    className="rounded border border-border bg-background/80 p-2 text-foreground backdrop-blur transition-colors hover:bg-background"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-3 border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {showPrompt && (
              <div className="mt-4 h-48 overflow-y-auto rounded border border-border bg-muted p-4">
                <pre className="font-mono text-xs text-foreground">{buildPrompt(config)}</pre>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button onClick={handleGenerate} disabled={loading} size="lg" className="min-w-44">
                <Sparkles size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Generating..." : "Generate Scene"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
