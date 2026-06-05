import type { ComponentType, Dispatch, ReactNode } from "react";

export interface GenerativeImageConfig {
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

export interface GenerativeImageFormState {
  image_specifications: GenerativeImageConfig["image_specifications"] & {
    aestheticDraft: string;
  };
  subject: GenerativeImageConfig["subject"];
  attire: GenerativeImageConfig["attire"];
  environment: GenerativeImageConfig["environment"];
  lighting: GenerativeImageConfig["lighting"] & {
    effectsDraft: string;
  };
  visual_style: GenerativeImageConfig["visual_style"];
}

export type GenerativeImageAction =
  | {
      type: "image_specifications/update";
      key: "format" | "dimensions";
      value: string;
    }
  | {
      type: "image_specifications/updateAestheticDraft";
      value: string;
    }
  | { type: "subject/update"; key: keyof GenerativeImageConfig["subject"]; value: string }
  | { type: "attire/update"; key: keyof GenerativeImageConfig["attire"]; value: string }
  | {
      type: "environment/update";
      key: Exclude<keyof GenerativeImageConfig["environment"], "background">;
      value: string;
    }
  | {
      type: "environment/background/update";
      key: keyof GenerativeImageConfig["environment"]["background"];
      value: string;
    }
  | { type: "lighting/update"; key: "type"; value: string }
  | {
      type: "lighting/updateEffectsDraft";
      value: string;
    }
  | {
      type: "visual_style/update";
      key: keyof GenerativeImageConfig["visual_style"];
      value: string;
    };

export type GenerativeImageDispatch = Dispatch<GenerativeImageAction>;

export type SectionPanelProps = {
  value: string;
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
};
