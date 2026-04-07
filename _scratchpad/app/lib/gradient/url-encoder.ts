import { type GradientSettings, GradientSettingsSchema } from './schema';

export const encodeSettings = (settings: GradientSettings): string => {
  try {
    const jsonString = JSON.stringify(settings);
    return btoa(jsonString);
  } catch (error) {
    console.error('Failed to encode settings:', error);
    return '';
  }
};

export const decodeSettings = (hash: string): Partial<GradientSettings> | null => {
  if (!hash) return null;

  try {
    const jsonString = atob(hash);
    const parsedSettings = JSON.parse(jsonString);

    // Use safeParse to validate and get only valid fields
    const validationResult = GradientSettingsSchema.safeParse(parsedSettings);

    if (validationResult.success) {
      return validationResult.data;
    }
    // Try to extract partial valid data
    const partialSettings: Partial<GradientSettings> = {};

    // Validate each field individually and include only valid ones
    if (
      typeof parsedSettings?.degree === 'number' &&
      parsedSettings.degree >= 0 &&
      parsedSettings.degree <= 360
    ) {
      partialSettings.degree = parsedSettings.degree;
    }

    if (
      Array.isArray(parsedSettings?.opacities) &&
      parsedSettings.opacities.length === 4 &&
      parsedSettings.opacities.every((o: unknown) => typeof o === 'number' && o >= 0 && o <= 1)
    ) {
      partialSettings.opacities = parsedSettings.opacities as number[];
    }

    if (
      Array.isArray(parsedSettings?.positions) &&
      parsedSettings.positions.length === 4 &&
      parsedSettings.positions.every((p: unknown) => typeof p === 'number' && p >= 0 && p <= 100)
    ) {
      partialSettings.positions = parsedSettings.positions as number[];
    }

    if (
      Array.isArray(parsedSettings?.colors) &&
      parsedSettings.colors.length === 4 &&
      parsedSettings.colors.every(
        (c: unknown) => typeof c === 'string' && /^#[0-9A-Fa-f]{6}$/.test(c)
      )
    ) {
      partialSettings.colors = parsedSettings.colors as string[];
    }

    if (
      typeof parsedSettings?.borderWidth === 'number' &&
      parsedSettings.borderWidth >= 1 &&
      parsedSettings.borderWidth <= 20
    ) {
      partialSettings.borderWidth = parsedSettings.borderWidth;
    }

    if (typeof parsedSettings?.backgroundImage === 'string') {
      if (
        parsedSettings.backgroundImage === '' ||
        /^https?:\/\//.test(parsedSettings.backgroundImage)
      ) {
        partialSettings.backgroundImage = parsedSettings.backgroundImage;
      }
    }

    if (
      typeof parsedSettings?.backgroundColor === 'string' &&
      /^#[0-9A-Fa-f]{6}$/.test(parsedSettings.backgroundColor)
    ) {
      partialSettings.backgroundColor = parsedSettings.backgroundColor;
    }

    if (parsedSettings?.glassGradient && typeof parsedSettings.glassGradient === 'object') {
      const glass = parsedSettings.glassGradient as Record<string, unknown>;
      if (
        typeof glass.direction === 'string' &&
        typeof glass.startColor === 'string' &&
        /^#[0-9A-Fa-f]{6}$/.test(glass.startColor) &&
        typeof glass.startOpacity === 'number' &&
        glass.startOpacity >= 0 &&
        glass.startOpacity <= 1 &&
        typeof glass.endColor === 'string' &&
        /^#[0-9A-Fa-f]{6}$/.test(glass.endColor) &&
        typeof glass.endOpacity === 'number' &&
        glass.endOpacity >= 0 &&
        glass.endOpacity <= 1
      ) {
        partialSettings.glassGradient = {
          direction: glass.direction,
          startColor: glass.startColor,
          startOpacity: glass.startOpacity,
          endColor: glass.endColor,
          endOpacity: glass.endOpacity,
        };
      }
    }

    console.warn(
      'Partial validation failed, using extracted valid fields:',
      validationResult.error
    );
    return Object.keys(partialSettings).length > 0 ? partialSettings : null;
  } catch (error) {
    console.warn('Failed to decode URL hash:', error);
    return null;
  }
};
