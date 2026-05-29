import {
  AlertCircle,
  Camera,
  ChevronDown,
  ChevronUp,
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

type SectionProps = {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
  defaultOpen?: boolean;
};

function Section({ title, icon: Icon, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between bg-slate-800 p-4 text-left transition-colors hover:bg-slate-700"
      >
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <Icon size={18} className="text-blue-400" />
          {title}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="space-y-4 p-4">{children}</div>}
    </div>
  );
}

type InputGroupProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "textarea";
  help?: string;
};

function InputGroup({ label, value, onChange, type = "text", help }: InputGroupProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-20 w-full resize-none rounded border border-slate-700 bg-slate-900 p-2 text-sm text-slate-200 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm text-slate-200 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
      )}
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
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
        image_specifications: {
          ...state.image_specifications,
          [action.key]: action.value,
        },
      };
    case "subject/update":
      return {
        ...state,
        subject: {
          ...state.subject,
          [action.key]: action.value,
        },
      };
    case "attire/update":
      return {
        ...state,
        attire: {
          ...state.attire,
          [action.key]: action.value,
        },
      };
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
          background: {
            ...state.environment.background,
            [action.key]: action.value,
          },
        },
      };
    case "lighting/update":
      return {
        ...state,
        lighting: {
          ...state.lighting,
          [action.key]: action.value,
        },
      };
    case "visual_style/update":
      return {
        ...state,
        visual_style: {
          ...state.visual_style,
          [action.key]: action.value,
        },
      };
    default:
      return state;
  }
}

type SectionDispatch = Dispatch<ConfigAction>;

type ImageSpecificationsSectionProps = {
  config: Config["image_specifications"];
  dispatch: SectionDispatch;
};

type SubjectSectionProps = {
  config: Config["subject"];
  dispatch: SectionDispatch;
};

type AttireSectionProps = {
  config: Config["attire"];
  dispatch: SectionDispatch;
};

type EnvironmentSectionProps = {
  config: Config["environment"];
  dispatch: SectionDispatch;
};

type LightingSectionProps = {
  config: Config["lighting"];
  dispatch: SectionDispatch;
};

type VisualStyleSectionProps = {
  config: Config["visual_style"];
  dispatch: SectionDispatch;
};

const ImageSpecificationsSection = memo(function ImageSpecificationsSection({
  config,
  dispatch,
}: ImageSpecificationsSectionProps) {
  return (
    <Section title="Image Specifications" icon={Camera} defaultOpen>
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
        label="Aesthetic (Comma separated)"
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
    </Section>
  );
});

const SubjectSection = memo(function SubjectSection({ config, dispatch }: SubjectSectionProps) {
  return (
    <Section title="Subject Details" icon={User}>
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
    </Section>
  );
});

const AttireSection = memo(function AttireSection({ config, dispatch }: AttireSectionProps) {
  return (
    <Section title="Attire" icon={Shirt}>
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
    </Section>
  );
});

const EnvironmentSection = memo(function EnvironmentSection({
  config,
  dispatch,
}: EnvironmentSectionProps) {
  return (
    <Section title="Environment" icon={MapPin}>
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
      <div className="mt-2 border-t border-slate-700 pt-2">
        <p className="mb-2 text-xs font-semibold text-slate-500">BACKGROUND</p>
        <InputGroup
          label="Visibility"
          value={config.background.visibility}
          onChange={(value) =>
            dispatch({ type: "environment/background/update", key: "visibility", value })
          }
        />
        <div className="h-2" />
        <InputGroup
          label="Ambient Elements"
          value={config.background.ambient_elements}
          onChange={(value) =>
            dispatch({ type: "environment/background/update", key: "ambient_elements", value })
          }
          type="textarea"
        />
      </div>
    </Section>
  );
});

const LightingSection = memo(function LightingSection({ config, dispatch }: LightingSectionProps) {
  return (
    <Section title="Lighting" icon={Zap}>
      <InputGroup
        label="Type"
        value={config.type}
        onChange={(value) => dispatch({ type: "lighting/update", key: "type", value })}
      />
      <InputGroup
        label="Effects (Comma separated)"
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
    </Section>
  );
});

const VisualStyleSection = memo(function VisualStyleSection({
  config,
  dispatch,
}: VisualStyleSectionProps) {
  return (
    <Section title="Visual Style" icon={Palette}>
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
    </Section>
  );
});

function DirectorApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [config, dispatch] = useReducer(configReducer, initialConfig);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/director/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(String(caughtError) || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 font-sans text-slate-200">
      <header className="mx-auto mb-8 flex max-w-7xl items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-2">
            <Camera className="text-white" size={24} />
          </div>
          <div>
            <h1>Director&apos;s Console</h1>
            <p className="text-sm text-slate-400">Parametric Image Generation</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowRawJson((current) => !current)}
          className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-blue-400"
        >
          <Code size={16} />
          {showRawJson ? "Hide Config" : "Show Config"}
        </button>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="custom-scrollbar h-[calc(100vh-140px)] space-y-2 overflow-y-auto pb-20 pr-2 lg:col-span-5">
          <ImageSpecificationsSection config={config.image_specifications} dispatch={dispatch} />
          <SubjectSection config={config.subject} dispatch={dispatch} />
          <AttireSection config={config.attire} dispatch={dispatch} />
          <EnvironmentSection config={config.environment} dispatch={dispatch} />
          <LightingSection config={config.lighting} dispatch={dispatch} />
          <VisualStyleSection config={config.visual_style} dispatch={dispatch} />
        </div>

        <div className="flex h-[calc(100vh-140px)] flex-col lg:col-span-7">
          <div className="group relative flex grow items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-2xl shadow-black/50">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated result"
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
                  <Sparkles className="text-slate-600" size={32} />
                </div>
                <h3>Ready to Imagine</h3>
                <p className="mx-auto mt-2 max-w-sm text-slate-500">
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
                  className="rounded-lg bg-black/60 p-3 text-white backdrop-blur transition-all hover:bg-black/80"
                  title="Download"
                >
                  <Download size={20} />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {showRawJson && (
            <div className="mt-4 h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 p-4 custom-scrollbar">
              <pre className="font-mono text-xs text-blue-300">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className={`
                flex items-center gap-3 rounded-lg px-8 py-4 font-bold text-white shadow-lg transition-all active:scale-95
                ${loading ? "cursor-not-allowed bg-slate-700 opacity-50" : "hover:shadow-blue-500/25"}
              `}
            >
              <Sparkles size={20} className={loading ? "animate-spin" : ""} />
              {loading ? "Generating..." : "Generate Scene"}
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 1);
        }
      `}</style>
    </div>
  );
}

export default DirectorApp;
