import * as Cesium from "cesium";

/**
 * Configuration options for post-processing effects
 */
export interface PostProcessConfig {
  /** Enable bloom effect for glowing highlights */
  bloom?: {
    enabled: boolean;
    intensity?: number;
    threshold?: number;
    radius?: number;
  };
  /** Enable FXAA anti-aliasing */
  fxaa?: {
    enabled: boolean;
  };
  /** Enable silhouette highlighting for selected entities */
  silhouette?: {
    enabled: boolean;
    color?: string;
    length?: number;
  };
}

/**
 * Manages post-processing effects for Cesium scenes
 * Provides a reusable, configurable system for visual enhancements
 */
export class PostProcessingManager {
  private postProcessStages: Cesium.PostProcessStageCollection;
  private activeStages: Map<string, Cesium.PostProcessStage> = new Map();

  constructor(viewer: Cesium.Viewer) {
    this.postProcessStages = viewer.scene.postProcessStages;
  }

  /**
   * Apply a complete post-processing configuration
   */
  applyConfig(config: PostProcessConfig): void {
    this.clearAll();

    if (config.bloom?.enabled) {
      this.enableBloom(config.bloom);
    }

    if (config.fxaa?.enabled) {
      this.enableFXAA();
    }

    if (config.silhouette?.enabled) {
      this.enableSilhouette(config.silhouette);
    }
  }

  /**
   * Enable bloom effect for glowing highlights
   * Great for neon themes, city lights, and energy effects
   */
  enableBloom(options: NonNullable<PostProcessConfig["bloom"]>): void {
    // Create bloom effect using custom fragment shader
    const bloom = new Cesium.PostProcessStage({
      name: "bloom",
      fragmentShader: `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        
        void main() {
          vec4 color = texture2D(colorTexture, v_textureCoordinates);
          float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          vec3 bloom = max(color.rgb - ${(options.threshold ?? 0.4).toFixed(2)}, 0.0) * ${(options.intensity ?? 2.0).toFixed(2)};
          gl_FragColor = vec4(color.rgb + bloom, color.a);
        }
      `,
    });

    this.postProcessStages.add(bloom);
    this.activeStages.set("bloom", bloom);
  }

  /**
   * Enable FXAA anti-aliasing for smoother edges
   */
  enableFXAA(): void {
    // Use built-in FXAA if available, otherwise skip
    const fxaa = new Cesium.PostProcessStage({
      name: "fxaa",
      fragmentShader: `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        
        void main() {
          vec2 texCoord = v_textureCoordinates;
          vec2 texSize = vec2(textureSize(colorTexture, 0));
          vec2 invTexSize = 1.0 / texSize;
          
          vec3 rgbNW = texture2D(colorTexture, texCoord + vec2(-1.0, -1.0) * invTexSize).rgb;
          vec3 rgbNE = texture2D(colorTexture, texCoord + vec2(1.0, -1.0) * invTexSize).rgb;
          vec3 rgbSW = texture2D(colorTexture, texCoord + vec2(-1.0, 1.0) * invTexSize).rgb;
          vec3 rgbSE = texture2D(colorTexture, texCoord + vec2(1.0, 1.0) * invTexSize).rgb;
          vec3 rgbM = texture2D(colorTexture, texCoord).rgb;
          
          vec3 luma = vec3(0.299, 0.587, 0.114);
          float lumaNW = dot(rgbNW, luma);
          float lumaNE = dot(rgbNE, luma);
          float lumaSW = dot(rgbSW, luma);
          float lumaSE = dot(rgbSE, luma);
          float lumaM = dot(rgbM, luma);
          
          float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
          float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
          
          vec2 dir = vec2(
            -((lumaNW + lumaNE) - (lumaSW + lumaSE)),
            ((lumaNW + lumaSW) - (lumaNE + lumaSE))
          );
          
          float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * 0.25 * (1.0 / 8.0), 1.0 / 128.0);
          float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
          dir = min(vec2(8.0, 8.0), max(vec2(-8.0, -8.0), dir * rcpDirMin)) * invTexSize;
          
          vec3 rgbA = 0.5 * (
            texture2D(colorTexture, texCoord + dir * (1.0 / 3.0 - 0.5)).rgb +
            texture2D(colorTexture, texCoord + dir * (2.0 / 3.0 - 0.5)).rgb
          );
          vec3 rgbB = rgbA * 0.5 + 0.25 * (
            texture2D(colorTexture, texCoord + dir * -0.5).rgb +
            texture2D(colorTexture, texCoord + dir * 0.5).rgb
          );
          
          float lumaB = dot(rgbB, luma);
          vec3 result = (lumaB < lumaMin || lumaB > lumaMax) ? rgbA : rgbB;
          
          gl_FragColor = vec4(result, 1.0);
        }
      `,
    });

    this.postProcessStages.add(fxaa);
    this.activeStages.set("fxaa", fxaa);
  }

  /**
   * Enable silhouette highlighting for selected entities
   * Uses a color-based edge detection approach
   */
  enableSilhouette(options: NonNullable<PostProcessConfig["silhouette"]>): void {
    const color = Cesium.Color.fromCssColorString(options.color ?? "#ffff00");
    
    // Create silhouette effect using color-based edge detection
    const silhouette = new Cesium.PostProcessStage({
      name: "silhouette",
      fragmentShader: `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        
        void main() {
          vec2 texCoord = v_textureCoordinates;
          vec2 texSize = vec2(textureSize(colorTexture, 0));
          vec2 invTexSize = 1.0 / texSize;
          
          vec4 center = texture2D(colorTexture, texCoord);
          vec4 n = texture2D(colorTexture, texCoord + vec2(0.0, -1.0) * invTexSize);
          vec4 s = texture2D(colorTexture, texCoord + vec2(0.0, 1.0) * invTexSize);
          vec4 e = texture2D(colorTexture, texCoord + vec2(1.0, 0.0) * invTexSize);
          vec4 w = texture2D(colorTexture, texCoord + vec2(-1.0, 0.0) * invTexSize);
          
          float edge = length(center.rgb - n.rgb) + length(center.rgb - s.rgb) + 
                       length(center.rgb - e.rgb) + length(center.rgb - w.rgb);
          
          vec3 highlight = vec3(${color.red.toFixed(3)}, ${color.green.toFixed(3)}, ${color.blue.toFixed(3)});
          
          float edgeStrength = smoothstep(0.1, 0.3, edge) * ${(options.length ?? 0.5).toFixed(2)};
          gl_FragColor = vec4(mix(center.rgb, highlight, edgeStrength), center.a);
        }
      `,
    });

    this.postProcessStages.add(silhouette);
    this.activeStages.set("silhouette", silhouette);
  }

  /**
   * Remove a specific effect by name
   */
  removeEffect(name: string): void {
    const stage = this.activeStages.get(name);
    if (stage) {
      this.postProcessStages.remove(stage);
      this.activeStages.delete(name);
    }
  }

  /**
   * Clear all post-processing effects
   */
  clearAll(): void {
    this.activeStages.forEach((stage) => {
      this.postProcessStages.remove(stage);
    });
    this.activeStages.clear();
  }

  /**
   * Check if an effect is currently active
   */
  hasEffect(name: string): boolean {
    return this.activeStages.has(name);
  }

  /**
   * Get list of active effect names
   */
  getActiveEffects(): string[] {
    return Array.from(this.activeStages.keys());
  }

  /**
   * Preset configurations for common visual styles
   */
  static readonly PRESETS = {
    /** Cinematic documentary style */
    CINEMATIC: {
      bloom: { enabled: true, intensity: 1.5, threshold: 0.3, radius: 0.8 },
      fxaa: { enabled: true },
    } as PostProcessConfig,

    /** Neon/cyberpunk style for data visualization */
    NEON: {
      bloom: { enabled: true, intensity: 3.0, threshold: 0.2, radius: 1.5 },
      fxaa: { enabled: true },
      silhouette: { enabled: true, color: "#00ffff", length: 0.5 },
    } as PostProcessConfig,

    /** Clean scientific visualization */
    SCIENTIFIC: {
      fxaa: { enabled: true },
      silhouette: { enabled: true, color: "#ffffff", length: 0.3 },
    } as PostProcessConfig,

    /** Performance mode - minimal effects */
    PERFORMANCE: {
      fxaa: { enabled: true },
    } as PostProcessConfig,
  };
}
