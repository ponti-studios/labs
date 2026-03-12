import * as Cesium from "cesium";

/**
 * Particle system configuration for data visualization effects
 */
export interface ParticleSystemConfig {
  /** Position in Cartesian coordinates */
  position: Cesium.Cartesian3;
  /** Type of particle effect */
  type: "fire" | "smoke" | "explosion" | "energy" | "custom";
  /** Emission rate - particles per second */
  emissionRate?: number;
  /** Particle lifetime in seconds */
  particleLife?: number;
  /** Size of particles */
  particleSize?: number;
  /** Color of particles */
  color?: string;
  /** Secondary color for gradients */
  endColor?: string;
  /** Size of emission area */
  emitterRadius?: number;
  /** Height of emission */
  emitterHeight?: number;
  /** Initial velocity scale */
  speed?: number;
  /** Gravity effect (negative for upward) */
  gravity?: number;
  /** Duration of the effect in seconds (undefined for infinite) */
  duration?: number;
  /** Scale over lifetime */
  scale?: number;
  /** Texture URL for particles (uses default if not provided) */
  textureUrl?: string;
}

/**
 * Particle system constructor options type
 */
type ParticleSystemOptions = ConstructorParameters<typeof Cesium.ParticleSystem>[0];

/**
 * Manages particle systems for data visualization
 * Reusable for fire, smoke, explosions, energy effects on conflict events, etc.
 */
export class ParticleSystemManager {
  private viewer: Cesium.Viewer;
  private particleSystems: Map<string, Cesium.ParticleSystem> = new Map();
  private timeouts: Map<string, number> = new Map();

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * Create a particle system from configuration
   */
  create(id: string, config: ParticleSystemConfig): Cesium.ParticleSystem {
    this.remove(id);

    const system = this.buildParticleSystem(config);
    this.viewer.scene.primitives.add(system);
    this.particleSystems.set(id, system);

    // Auto-remove after duration if specified
    if (config.duration && config.duration > 0) {
      const timeoutId = window.setTimeout(() => {
        this.remove(id);
      }, config.duration * 1000);
      this.timeouts.set(id, timeoutId);
    }

    return system;
  }

  /**
   * Build particle system based on type and config
   */
  private buildParticleSystem(config: ParticleSystemConfig): Cesium.ParticleSystem {
    const startColor = Cesium.Color.fromCssColorString(config.color ?? "#ff6600");
    const endColor = Cesium.Color.fromCssColorString(config.endColor ?? "#333333");

    // Create model matrix from position
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(config.position);

    const baseConfig: ParticleSystemOptions = {
      modelMatrix,
      emissionRate: config.emissionRate ?? 100,
      image: config.textureUrl ?? this.getDefaultTexture(),
      startColor,
      endColor: endColor.withAlpha(0),
      startScale: config.scale ?? 1.0,
      endScale: (config.scale ?? 1.0) * 3,
      minimumParticleLife: (config.particleLife ?? 2) * 0.8,
      maximumParticleLife: config.particleLife ?? 2,
      speed: config.speed ?? 5,
      imageSize: new Cesium.Cartesian2(
        config.particleSize ?? 20,
        config.particleSize ?? 20
      ),
      emitter: new Cesium.CircleEmitter(
        config.emitterRadius ?? 2
      ),
    };

    switch (config.type) {
      case "fire":
        return this.createFireSystem(baseConfig, config);
      case "smoke":
        return this.createSmokeSystem(baseConfig, config);
      case "explosion":
        return this.createExplosionSystem(baseConfig, config);
      case "energy":
        return this.createEnergySystem(baseConfig, config);
      default:
        return new Cesium.ParticleSystem(baseConfig);
    }
  }

  /**
   * Fire effect - rising orange/red particles
   */
  private createFireSystem(
    baseConfig: ParticleSystemOptions,
    config: ParticleSystemConfig
  ): Cesium.ParticleSystem {
    return new Cesium.ParticleSystem({
      ...baseConfig,
      emissionRate: config.emissionRate ?? 200,
      startColor: Cesium.Color.fromCssColorString(config.color ?? "#ff4400"),
      endColor: Cesium.Color.fromCssColorString(config.endColor ?? "#331100").withAlpha(0),
      startScale: 0.5,
      endScale: 2.0,
      minimumParticleLife: 0.5,
      maximumParticleLife: 1.5,
      speed: config.speed ?? 8,
      emitter: new Cesium.CircleEmitter(config.emitterRadius ?? 3),
    });
  }

  /**
   * Smoke effect - rising gray particles
   */
  private createSmokeSystem(
    baseConfig: ParticleSystemOptions,
    config: ParticleSystemConfig
  ): Cesium.ParticleSystem {
    return new Cesium.ParticleSystem({
      ...baseConfig,
      emissionRate: config.emissionRate ?? 50,
      startColor: Cesium.Color.fromCssColorString(config.color ?? "#666666"),
      endColor: Cesium.Color.fromCssColorString(config.endColor ?? "#222222").withAlpha(0),
      startScale: 1.0,
      endScale: 5.0,
      minimumParticleLife: 3,
      maximumParticleLife: 5,
      speed: config.speed ?? 3,
      emitter: new Cesium.CircleEmitter(config.emitterRadius ?? 5),
    });
  }

  /**
   * Explosion effect - burst of particles
   */
  private createExplosionSystem(
    baseConfig: ParticleSystemOptions,
    config: ParticleSystemConfig
  ): Cesium.ParticleSystem {
    const system = new Cesium.ParticleSystem({
      ...baseConfig,
      emissionRate: config.emissionRate ?? 500,
      startColor: Cesium.Color.fromCssColorString(config.color ?? "#ffaa00"),
      endColor: Cesium.Color.fromCssColorString(config.endColor ?? "#ff0000").withAlpha(0),
      startScale: 1.0,
      endScale: 0.5,
      minimumParticleLife: 0.3,
      maximumParticleLife: 1.0,
      speed: config.speed ?? 20,
      emitter: new Cesium.SphereEmitter(config.emitterRadius ?? 10),
    });

    // Burst emission - high rate then stop
    system.emissionRate = config.emissionRate ?? 1000;
    setTimeout(() => {
      system.emissionRate = 0;
    }, 100);

    return system;
  }

  /**
   * Energy effect - pulsing glow particles
   */
  private createEnergySystem(
    baseConfig: ParticleSystemOptions,
    config: ParticleSystemConfig
  ): Cesium.ParticleSystem {
    return new Cesium.ParticleSystem({
      ...baseConfig,
      emissionRate: config.emissionRate ?? 150,
      startColor: Cesium.Color.fromCssColorString(config.color ?? "#00ffff"),
      endColor: Cesium.Color.fromCssColorString(config.endColor ?? "#0000ff").withAlpha(0),
      startScale: 0.3,
      endScale: 1.5,
      minimumParticleLife: 0.5,
      maximumParticleLife: 1.5,
      speed: config.speed ?? 10,
      emitter: new Cesium.SphereEmitter(config.emitterRadius ?? 2),
    });
  }

  /**
   * Create a conflict event visualization (fire + smoke)
   */
  createConflictEvent(
    id: string,
    longitude: number,
    latitude: number,
    altitude: number,
    intensity: "low" | "medium" | "high" | "extreme"
  ): void {
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

    const configs: Record<string, Partial<ParticleSystemConfig>> = {
      low: { emissionRate: 50, particleSize: 15, speed: 5 },
      medium: { emissionRate: 150, particleSize: 25, speed: 8 },
      high: { emissionRate: 300, particleSize: 35, speed: 12 },
      extreme: { emissionRate: 500, particleSize: 50, speed: 15 },
    };

    const config = configs[intensity];

    // Fire at base
    this.create(`${id}-fire`, {
      position,
      type: "fire",
      color: "#ff4400",
      endColor: "#ffaa00",
      ...config,
      emitterRadius: (config.particleSize ?? 20) * 0.5,
    });

    // Smoke rising above
    this.create(`${id}-smoke`, {
      position: Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        altitude + (config.particleSize ?? 20)
      ),
      type: "smoke",
      color: "#555555",
      endColor: "#222222",
      emissionRate: (config.emissionRate ?? 100) * 0.3,
      particleSize: (config.particleSize ?? 20) * 1.5,
      speed: (config.speed ?? 5) * 0.4,
      emitterRadius: (config.particleSize ?? 20) * 0.8,
    });
  }

  /**
   * Create an explosion at a location
   */
  createExplosion(
    id: string,
    longitude: number,
    latitude: number,
    altitude: number,
    color?: string
  ): void {
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

    this.create(id, {
      position,
      type: "explosion",
      color: color ?? "#ff6600",
      endColor: "#ff0000",
      duration: 2,
      emitterRadius: 20,
    });
  }

  /**
   * Remove a particle system
   */
  remove(id: string): void {
    const system = this.particleSystems.get(id);
    if (system) {
      this.viewer.scene.primitives.remove(system);
      this.particleSystems.delete(id);
    }

    // Clear timeout if exists
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }

    // Also remove related systems (fire/smoke pairs)
    const fireId = `${id}-fire`;
    const smokeId = `${id}-smoke`;
    if (this.particleSystems.has(fireId)) this.remove(fireId);
    if (this.particleSystems.has(smokeId)) this.remove(smokeId);
  }

  /**
   * Remove all particle systems
   */
  removeAll(): void {
    this.particleSystems.forEach((system) => {
      this.viewer.scene.primitives.remove(system);
    });
    this.particleSystems.clear();

    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }

  /**
   * Check if a particle system exists
   */
  has(id: string): boolean {
    return this.particleSystems.has(id);
  }

  /**
   * Get all active particle system IDs
   */
  getActiveIds(): string[] {
    return Array.from(this.particleSystems.keys());
  }

  /**
   * Get default particle texture (smoke puff)
   */
  private getDefaultTexture(): string {
    // Create a simple radial gradient texture as data URL
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return canvas.toDataURL();
  }
}
