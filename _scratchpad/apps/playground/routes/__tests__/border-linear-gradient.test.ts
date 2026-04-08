import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type GradientSettings,
  decodeSettings,
  defaultSettings,
  encodeSettings,
} from '~/lib/gradient';

// Mock console methods to avoid noise in tests
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('decodeSettings', () => {
  it('should return null for empty hash', () => {
    expect(decodeSettings('')).toBeNull();
  });

  it('should return null for invalid base64', () => {
    expect(decodeSettings('invalid!!!')).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    const invalidBase64 = btoa('invalid json');
    expect(decodeSettings(invalidBase64)).toBeNull();
  });

  it('should decode valid complete settings', () => {
    const encoded = encodeSettings(defaultSettings);
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual(defaultSettings);
  });

  it('should handle partial settings - only degree', () => {
    const partialSettings = { degree: 45 };
    // Use encodeSettings to test the full encoding/decoding cycle
    const encoded = encodeSettings(partialSettings as GradientSettings);
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual({ degree: 45 });
  });

  it('should handle partial settings - degree and colors', () => {
    const partialSettings = {
      degree: 90,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
    };
    // Use encodeSettings to test the full encoding/decoding cycle
    const encoded = encodeSettings(partialSettings as GradientSettings);
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual({
      degree: 90,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
    });
  });

  it('should handle partial glass gradient', () => {
    const partialSettings = {
      degree: 180,
      glassGradient: {
        direction: 'to top',
        startColor: '#ff0000',
        startOpacity: 0.3,
        endColor: '#0000ff',
        endOpacity: 0.1,
      },
    };
    // Use encodeSettings to test the full encoding/decoding cycle
    const encoded = encodeSettings(partialSettings as GradientSettings);
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual(partialSettings);
  });

  it('should reject invalid degree values', () => {
    const invalidSettings = { degree: 400 }; // > 360
    // Use btoa for invalid data to simulate external sources
    const encoded = btoa(JSON.stringify(invalidSettings));
    const decoded = decodeSettings(encoded);

    expect(decoded).toBeNull();
  });

  it('should reject invalid opacity values', () => {
    const invalidSettings = { opacities: [0.5, 1.5, 0.3, 0.1] }; // 1.5 > 1
    // Use btoa for invalid data to simulate external sources
    const encoded = btoa(JSON.stringify(invalidSettings));
    const decoded = decodeSettings(encoded);

    expect(decoded).toBeNull();
  });

  it('should reject invalid color format', () => {
    const invalidSettings = {
      colors: ['red', '#00ff00', '#0000ff', '#ffff00'],
    }; // "red" is invalid
    // Use btoa for invalid data to simulate external sources
    const encoded = btoa(JSON.stringify(invalidSettings));
    const decoded = decodeSettings(encoded);

    expect(decoded).toBeNull();
  });

  it('should reject wrong array lengths', () => {
    const invalidSettings = { colors: ['#ff0000', '#00ff00'] }; // only 2 colors instead of 4
    // Use btoa for invalid data to simulate external sources
    const encoded = btoa(JSON.stringify(invalidSettings));
    const decoded = decodeSettings(encoded);

    expect(decoded).toBeNull();
  });

  it('should accept valid background image URL', () => {
    const validSettings = { backgroundImage: 'https://example.com/image.png' };
    // Use encodeSettings to test our encoding logic
    const encoded = encodeSettings(validSettings as GradientSettings);
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual(validSettings);
  });

  it('should accept empty background image', () => {
    const validSettings = { backgroundImage: '' };
    // Use encodeSettings to test our encoding logic
    const encoded = encodeSettings(validSettings as GradientSettings);
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual(validSettings);
  });

  it('should reject invalid background image URL', () => {
    const invalidSettings = { backgroundImage: 'not-a-url' };
    // Use btoa for invalid data to simulate external sources
    const encoded = btoa(JSON.stringify(invalidSettings));
    const decoded = decodeSettings(encoded);

    expect(decoded).toBeNull();
  });

  it('should handle mixed valid and invalid fields', () => {
    const mixedSettings = {
      degree: 45, // valid
      colors: ['invalid', '#00ff00', '#0000ff', '#ffff00'], // invalid
      borderWidth: 5, // valid
      backgroundColor: '#123456', // valid
    };
    // Use btoa for invalid data to simulate external sources
    const encoded = btoa(JSON.stringify(mixedSettings));
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual({
      degree: 45,
      borderWidth: 5,
      backgroundColor: '#123456',
    });
  });

  it('should handle invalid glass gradient fields', () => {
    const invalidSettings = {
      degree: 45,
      glassGradient: {
        direction: 'to top',
        startColor: 'invalid-color', // invalid
        startOpacity: 0.3,
        endColor: '#0000ff',
        endOpacity: 1.5, // invalid > 1
      },
    };
    // Use btoa for invalid data to simulate external sources
    const encoded = btoa(JSON.stringify(invalidSettings));
    const decoded = decodeSettings(encoded);

    expect(decoded).toEqual({ degree: 45 });
  });

  it('should handle borderWidth edge cases', () => {
    const validMin = { borderWidth: 1 };
    const validMax = { borderWidth: 20 };
    const invalidMin = { borderWidth: 0 };
    const invalidMax = { borderWidth: 21 };

    expect(decodeSettings(btoa(JSON.stringify(validMin)))).toEqual(validMin);
    expect(decodeSettings(btoa(JSON.stringify(validMax)))).toEqual(validMax);
    expect(decodeSettings(btoa(JSON.stringify(invalidMin)))).toBeNull();
    expect(decodeSettings(btoa(JSON.stringify(invalidMax)))).toBeNull();
  });

  it('should handle position edge cases', () => {
    const validPositions = { positions: [0, 50, 75, 100] };
    const invalidPositions = { positions: [0, 50, 75, 101] }; // 101 > 100

    expect(decodeSettings(btoa(JSON.stringify(validPositions)))).toEqual(validPositions);
    expect(decodeSettings(btoa(JSON.stringify(invalidPositions)))).toBeNull();
  });

  describe('URL hash handling with defaults', () => {
    it('should return only decoded fields and preserve defaults for missing ones', () => {
      // Simulate what happens in the component when some settings are missing
      const partialFromUrl = {
        degree: 45,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
      };
      // Use encodeSettings to test our encoding logic
      const encoded = encodeSettings(partialFromUrl as GradientSettings);
      const decoded = decodeSettings(encoded);

      // The decode function should only return the valid fields from URL
      expect(decoded).toEqual(partialFromUrl);

      // In the component, missing fields would use defaultSettings values
      const finalSettings = {
        ...defaultSettings,
        ...decoded,
      };

      expect(finalSettings.degree).toBe(45); // from URL
      expect(finalSettings.colors).toEqual(['#ff0000', '#00ff00', '#0000ff', '#ffff00']); // from URL
      expect(finalSettings.opacities).toEqual(defaultSettings.opacities); // from defaults
      expect(finalSettings.borderWidth).toBe(defaultSettings.borderWidth); // from defaults
      expect(finalSettings.glassGradient).toEqual(defaultSettings.glassGradient); // from defaults
    });

    it('should handle completely invalid URL gracefully', () => {
      const decoded = decodeSettings('invalid-hash');
      expect(decoded).toBeNull();

      // Component would use all defaults
      const finalSettings = {
        ...defaultSettings,
        ...(decoded || {}),
      };

      expect(finalSettings).toEqual(defaultSettings);
    });

    it('should handle mixed valid/invalid fields preserving only valid ones', () => {
      const mixedData = {
        degree: 90, // valid
        colors: ['invalid', '#00ff00', '#0000ff', '#ffff00'], // invalid array
        borderWidth: 5, // valid
        opacities: [0.5, 1.5, 0.3, 0.1], // invalid (1.5 > 1)
        backgroundColor: '#123456', // valid
      };

      // Use btoa for invalid data to simulate external sources
      const decoded = decodeSettings(btoa(JSON.stringify(mixedData)));

      expect(decoded).toEqual({
        degree: 90,
        borderWidth: 5,
        backgroundColor: '#123456',
      });

      // Component would merge with defaults
      const finalSettings = {
        ...defaultSettings,
        ...decoded,
      };

      expect(finalSettings.degree).toBe(90); // from URL
      expect(finalSettings.borderWidth).toBe(5); // from URL
      expect(finalSettings.backgroundColor).toBe('#123456'); // from URL
      expect(finalSettings.colors).toEqual(defaultSettings.colors); // from defaults (invalid in URL)
      expect(finalSettings.opacities).toEqual(defaultSettings.opacities); // from defaults (invalid in URL)
    });
  });
});

describe('encodeSettings', () => {
  it('should encode valid settings correctly', () => {
    const encoded = encodeSettings(defaultSettings);
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');

    // Should be able to decode back to original settings
    const decoded = decodeSettings(encoded);
    expect(decoded).toEqual(defaultSettings);
  });

  it('should handle partial settings', () => {
    const partialSettings = { degree: 45, borderWidth: 5 } as GradientSettings;
    const encoded = encodeSettings(partialSettings);
    expect(encoded).toBeTruthy();

    const decoded = decodeSettings(encoded);
    expect(decoded).toEqual({ degree: 45, borderWidth: 5 });
  });

  it('should return empty string on encoding error', () => {
    // Mock JSON.stringify to throw an error
    const originalStringify = JSON.stringify;
    JSON.stringify = vi.fn().mockImplementation(() => {
      throw new Error('stringify error');
    });

    const encoded = encodeSettings(defaultSettings);
    expect(encoded).toBe('');

    // Restore original function
    JSON.stringify = originalStringify;
  });

  it('should handle circular reference gracefully', () => {
    // Create object with circular reference
    const circular: Record<string, unknown> = { degree: 45 };
    circular.self = circular;

    const encoded = encodeSettings(circular as unknown as GradientSettings);
    expect(encoded).toBe('');
  });

  it('should produce consistent encoding for same input', () => {
    const settings = { ...defaultSettings, degree: 123 };
    const encoded1 = encodeSettings(settings);
    const encoded2 = encodeSettings(settings);

    expect(encoded1).toBe(encoded2);
    expect(encoded1).toBeTruthy();
  });
});
