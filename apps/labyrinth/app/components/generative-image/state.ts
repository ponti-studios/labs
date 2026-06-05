import type {
  GenerativeImageAction,
  GenerativeImageConfig,
  GenerativeImageFormState,
} from "./types";

export const parseCommaSeparatedValues = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const initialGenerativeImageFormState: GenerativeImageFormState = {
  image_specifications: {
    format: "35mm Analog Film Photography",
    dimensions: "1200x1200px",
    aesthetic: ["Raw", "Nostalgic", "Gritty", "Candid Street Portrait"],
    aestheticDraft: "Raw, Nostalgic, Gritty, Candid Street Portrait",
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
    effectsDraft: "Strong highlights on face and body, Sharp shadows behind subject, High contrast",
  },
  visual_style: {
    color_palette: "Muted and slightly warm",
    texture: "Subtle but distinct film grain throughout",
    lens_characteristics: "Analog 35mm lens style",
  },
};

export function toGenerativeImageConfig(
  formState: GenerativeImageFormState,
): GenerativeImageConfig {
  return {
    image_specifications: {
      format: formState.image_specifications.format,
      dimensions: formState.image_specifications.dimensions,
      aesthetic: formState.image_specifications.aesthetic,
    },
    subject: formState.subject,
    attire: formState.attire,
    environment: formState.environment,
    lighting: {
      type: formState.lighting.type,
      effects: formState.lighting.effects,
    },
    visual_style: formState.visual_style,
  };
}

export function buildGenerativeImagePrompt(config: GenerativeImageConfig) {
  return `Generate a photorealistic image based on these strict specifications:\n${JSON.stringify(config, null, 2)}`;
}

export function generativeImageReducer(
  state: GenerativeImageFormState,
  action: GenerativeImageAction,
): GenerativeImageFormState {
  switch (action.type) {
    case "image_specifications/update":
      return {
        ...state,
        image_specifications: {
          ...state.image_specifications,
          [action.key]: action.value,
        },
      };
    case "image_specifications/updateAestheticDraft":
      return {
        ...state,
        image_specifications: {
          ...state.image_specifications,
          aestheticDraft: action.value,
          aesthetic: parseCommaSeparatedValues(action.value),
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
          [action.key]: action.value,
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
    case "lighting/updateEffectsDraft":
      return {
        ...state,
        lighting: {
          ...state.lighting,
          effectsDraft: action.value,
          effects: parseCommaSeparatedValues(action.value),
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
