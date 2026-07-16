import { AccordionContent, AccordionItem, AccordionTrigger } from "@pontistudios/ui";
import { Camera, MapPin, Palette, Shirt, User, Zap } from "lucide-react";
import { memo } from "react";

import type { GenerativeImageDispatch, GenerativeImageFormState, SectionPanelProps } from "./types";

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
      <label className="text-muted-foreground text-xs font-medium">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="border bg-background text-foreground focus:ring-ring h-20 w-full resize-none rounded border p-2 text-sm transition-all outline-none focus:border-transparent focus:ring-2"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="border bg-background text-foreground focus:ring-ring w-full rounded border p-2 text-sm transition-all outline-none focus:border-transparent focus:ring-2"
        />
      )}
      {help ? <p className="text-muted-foreground text-xs">{help}</p> : null}
    </div>
  );
}

function SectionPanel({ value, title, icon: Icon, children }: SectionPanelProps) {
  return (
    <AccordionItem value={value} className="border border-b">
      <AccordionTrigger className="py-3">
        <div className="text-foreground flex items-center gap-2 text-sm font-medium">
          <Icon size={16} className="text-muted-foreground" />
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-1 pb-2">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

export const ImageSpecificationsSection = memo(function ImageSpecificationsSection({
  config,
  dispatch,
}: {
  config: GenerativeImageFormState["image_specifications"];
  dispatch: GenerativeImageDispatch;
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
        value={config.aestheticDraft}
        onChange={(value) => dispatch({ type: "image_specifications/updateAestheticDraft", value })}
        type="textarea"
      />
    </SectionPanel>
  );
});

export const SubjectSection = memo(function SubjectSection({
  config,
  dispatch,
}: {
  config: GenerativeImageFormState["subject"];
  dispatch: GenerativeImageDispatch;
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

export const AttireSection = memo(function AttireSection({
  config,
  dispatch,
}: {
  config: GenerativeImageFormState["attire"];
  dispatch: GenerativeImageDispatch;
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

export const EnvironmentSection = memo(function EnvironmentSection({
  config,
  dispatch,
}: {
  config: GenerativeImageFormState["environment"];
  dispatch: GenerativeImageDispatch;
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
      <div className="border border-t pt-3">
        <p className="text-muted-foreground mb-3 text-xs font-medium">Background</p>
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

export const LightingSection = memo(function LightingSection({
  config,
  dispatch,
}: {
  config: GenerativeImageFormState["lighting"];
  dispatch: GenerativeImageDispatch;
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
        value={config.effectsDraft}
        onChange={(value) => dispatch({ type: "lighting/updateEffectsDraft", value })}
        type="textarea"
      />
    </SectionPanel>
  );
});

export const VisualStyleSection = memo(function VisualStyleSection({
  config,
  dispatch,
}: {
  config: GenerativeImageFormState["visual_style"];
  dispatch: GenerativeImageDispatch;
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
