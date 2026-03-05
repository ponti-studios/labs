import {
  AlertCircle,
  Camera,
  ChevronDown,
  ChevronUp,
  Code,
  Download,
  MapPin,
  Palette,
  RefreshCw,
  Shirt,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

// typed configuration structure
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

const DirectorApp: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  // Initial state matches the user's provided JSON structure
  const [config, setConfig] = useState({
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
        ambient_elements:
          "Blurred and slightly halated streetlights, car headlights, or neon signs",
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
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const apiKey = ""; // Injected by environment

    try {
      // We send the JSON configuration as a stringified prompt, which the model interprets well for structured generation
      const promptText = `Generate a photorealistic image based on these strict specifications: ${JSON.stringify(config, null, 2)}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: promptText,
              },
            ],
            parameters: {
              sampleCount: 1,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
        setGeneratedImage(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
      } else {
        throw new Error("No image data received from the API.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err) || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (path: string, value: string | string[]) => {
    setConfig((prev) => {
      const newState = { ...prev } as any;
      let current: any = newState;
      const keys = path.split(".");

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newState as Config;
    });
  };

  const updateArrayField = (path: string, value: string) => {
    // Splits comma-separated string into array
    const arrayValue = value.split(",").map((item: string) => item.trim());
    updateField(path, arrayValue);
  };

  interface SectionProps {
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }

  const Section: React.FC<SectionProps> = ({
    title,
    icon: Icon,
    children,
    defaultOpen = false,
  }) => {
    const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
    return (
      <div className="border border-slate-700 rounded-lg overflow-hidden mb-4 bg-slate-800/50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 transition-colors text-left"
        >
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Icon size={18} className="text-blue-400" />
            {title}
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isOpen && <div className="p-4 space-y-4">{children}</div>}
      </div>
    );
  };

  interface InputGroupProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: "text" | "textarea";
    help?: string;
  }

  const InputGroup: React.FC<InputGroupProps> = ({
    label,
    value,
    onChange,
    type = "text",
    help,
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-20 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      )}
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 font-sans">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Camera className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Director's Console</h1>
            <p className="text-sm text-slate-400">Parametric Image Generation</p>
          </div>
        </div>
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
        >
          <Code size={16} />
          {showRawJson ? "Hide Config" : "Show Config"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-2 h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar pb-20">
          <Section title="Image Specifications" icon={Camera} defaultOpen={true}>
            <InputGroup
              label="Format"
              value={config.image_specifications.format}
              onChange={(v: string) => updateField("image_specifications.format", v)}
            />
            <InputGroup
              label="Dimensions"
              value={config.image_specifications.dimensions}
              onChange={(v: string) => updateField("image_specifications.dimensions", v)}
            />
            <InputGroup
              label="Aesthetic (Comma separated)"
              value={config.image_specifications.aesthetic.join(", ")}
              onChange={(v: string) => updateArrayField("image_specifications.aesthetic", v)}
              type="textarea"
            />
          </Section>

          <Section title="Subject Details" icon={User}>
            <InputGroup
              label="Pose"
              value={config.subject.pose}
              onChange={(v: string) => updateField("subject.pose", v)}
            />
            <InputGroup
              label="Expression"
              value={config.subject.expression}
              onChange={(v: string) => updateField("subject.expression", v)}
            />
            <InputGroup
              label="Skin Rendering"
              value={config.subject.skin_rendering}
              onChange={(v: string) => updateField("subject.skin_rendering", v)}
            />
          </Section>

          <Section title="Attire" icon={Shirt}>
            <InputGroup
              label="Top"
              value={config.attire.top}
              onChange={(v: string) => updateField("attire.top", v)}
            />
            <InputGroup
              label="Bottom"
              value={config.attire.bottom}
              onChange={(v: string) => updateField("attire.bottom", v)}
            />
          </Section>

          <Section title="Environment" icon={MapPin}>
            <InputGroup
              label="Setting"
              value={config.environment.setting}
              onChange={(v: string) => updateField("environment.setting", v)}
            />
            <InputGroup
              label="Primary Prop"
              value={config.environment.primary_prop}
              onChange={(v: string) => updateField("environment.primary_prop", v)}
            />
            <div className="pt-2 border-t border-slate-700 mt-2">
              <p className="text-xs font-semibold text-slate-500 mb-2">BACKGROUND</p>
              <InputGroup
                label="Visibility"
                value={config.environment.background.visibility}
                onChange={(v: string) => updateField("environment.background.visibility", v)}
              />
              <div className="h-2"></div>
              <InputGroup
                label="Ambient Elements"
                value={config.environment.background.ambient_elements}
                onChange={(v: string) => updateField("environment.background.ambient_elements", v)}
                type="textarea"
              />
            </div>
          </Section>

          <Section title="Lighting" icon={Zap}>
            <InputGroup
              label="Type"
              value={config.lighting.type}
              onChange={(v: string) => updateField("lighting.type", v)}
            />
            <InputGroup
              label="Effects (Comma separated)"
              value={config.lighting.effects.join(", ")}
              onChange={(v: string) => updateArrayField("lighting.effects", v)}
              type="textarea"
            />
          </Section>

          <Section title="Visual Style" icon={Palette}>
            <InputGroup
              label="Color Palette"
              value={config.visual_style.color_palette}
              onChange={(v: string) => updateField("visual_style.color_palette", v)}
            />
            <InputGroup
              label="Texture"
              value={config.visual_style.texture}
              onChange={(v: string) => updateField("visual_style.texture", v)}
            />
            <InputGroup
              label="Lens Characteristics"
              value={config.visual_style.lens_characteristics}
              onChange={(v: string) => updateField("visual_style.lens_characteristics", v)}
            />
          </Section>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-140px)]">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex-grow flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-black/50">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated result"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <Sparkles className="text-slate-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-300">Ready to Imagine</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Configure your parameters on the left and hit generate to create a high-fidelity
                  image.
                </p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <RefreshCw className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="text-blue-400 font-medium animate-pulse">Developing...</p>
              </div>
            )}

            {/* Overlay Actions */}
            {generatedImage && !loading && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = generatedImage;
                    link.download = `director-export-${Date.now()}.png`;
                    link.click();
                  }}
                  className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur text-white rounded-lg transition-all"
                  title="Download"
                >
                  <Download size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Raw JSON View (Toggleable) */}
          {showRawJson && (
            <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800 h-48 overflow-y-auto custom-scrollbar">
              <pre className="text-xs text-blue-300 font-mono">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}

          {/* Action Bar */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`
                px-8 py-4 rounded-lg font-bold text-white shadow-lg flex items-center gap-3 transition-all transform active:scale-95
                ${
                  loading
                    ? "bg-slate-700 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25"
                }
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
};

export default DirectorApp;
