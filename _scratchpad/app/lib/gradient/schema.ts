import { z } from 'zod';

export const DEFAULT_URL =
  'https://images.unsplash.com/photo-1530092285049-1c42085fd395?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zmxvd2VyJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww';

export const GradientSettingsSchema = z.object({
  degree: z.number().min(0).max(360),
  opacities: z.array(z.number().min(0).max(1)).length(4),
  positions: z.array(z.number().min(0).max(100)).length(4),
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).length(4),
  borderWidth: z.number().min(1).max(20),
  backgroundImage: z.string().url().or(z.literal('')),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  glassGradient: z.object({
    direction: z.string(),
    startColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    startOpacity: z.number().min(0).max(1),
    endColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    endOpacity: z.number().min(0).max(1),
  }),
});

export interface GradientSettings {
  degree: number;
  opacities: number[];
  positions: number[];
  colors: string[];
  borderWidth: number;
  backgroundImage: string;
  backgroundColor: string;
  glassGradient: {
    direction: string;
    startColor: string;
    startOpacity: number;
    endColor: string;
    endOpacity: number;
  };
}

export const defaultSettings: GradientSettings = {
  degree: 130,
  opacities: [0.8, 0.5, 0.4, 0.1],
  positions: [0, 25, 50, 100],
  colors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
  borderWidth: 2,
  backgroundImage: DEFAULT_URL,
  backgroundColor: '#000000',
  glassGradient: {
    direction: 'to bottom right',
    startColor: '#ffffff',
    startOpacity: 0.1,
    endColor: '#ffffff',
    endOpacity: 0.05,
  },
};
