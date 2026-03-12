import * as Cesium from "cesium";

/**
 * Custom shader material configuration
 */
export interface ShaderMaterialConfig {
  /** Uniform variables for the shader */
  uniforms: Record<string, Cesium.Color | number | Cesium.Cartesian2 | Cesium.Cartesian3>;
  /** GLSL fragment shader source */
  fragmentShaderSource: string;
  /** Whether the material is translucent */
  translucent?: boolean;
}

/**
 * Predefined shader effects
 */
export type ShaderPreset =
  | "pulse"
  | "ripple"
  | "glow"
  | "scanline"
  | "heatmap"
  | "flow"
  | "custom";

/**
 * Manages custom GLSL shader materials for advanced visual effects
 * Reusable for pulsing rings, heatmaps, flow lines, and more
 */
export class ShaderMaterialManager {
  private viewer: Cesium.Viewer;
  private materials: Map<string, Cesium.Material> = new Map();
  private primitives: Map<string, Cesium.Primitive> = new Map();

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * Create a custom shader material
   */
  createMaterial(id: string, config: ShaderMaterialConfig): Cesium.Material {
    this.remove(id);

    const material = new Cesium.Material({
      fabric: {
        type: "CustomShader",
        uniforms: config.uniforms,
        source: config.fragmentShaderSource,
      },
      translucent: config.translucent ?? true,
    });

    this.materials.set(id, material);
    return material;
  }

  /**
   * Create a pulsing ring effect around a point
   */
  createPulseRing(
    id: string,
    longitude: number,
    latitude: number,
    options: {
      radius?: number;
      color?: string;
      speed?: number;
      thickness?: number;
    } = {}
  ): Cesium.Primitive {
    const radius = options.radius ?? 50000;
    const color = options.color ?? "#00ffff";
    const speed = options.speed ?? 2.0;
    const thickness = options.thickness ?? 0.1;

    const material = this.createMaterial(id, {
      uniforms: {
        color: Cesium.Color.fromCssColorString(color),
        speed: speed,
        thickness: thickness,
        time: 0,
      },
      fragmentShaderSource: `
        uniform vec4 color;
        uniform float speed;
        uniform float thickness;
        uniform float time;
        
        czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material material = czm_getDefaultMaterial(materialInput);
          
          float dist = length(materialInput.st - vec2(0.5));
          float pulse = fract(dist * 2.0 - time * speed);
          float alpha = smoothstep(thickness, 0.0, abs(pulse - 0.5));
          
          material.diffuse = color.rgb;
          material.alpha = alpha * color.a;
          
          return material;
        }
      `,
    });

    // Update time uniform each frame
    const startTime = Date.now();
    const updateTime = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      material.uniforms.time = elapsed;
      requestAnimationFrame(updateTime);
    };
    updateTime();

    // Create ellipse primitive
    const ellipseGeometry = new Cesium.EllipseGeometry({
      center: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      semiMajorAxis: radius,
      semiMinorAxis: radius,
      height: 1000,
    });

    const geometryInstance = new Cesium.GeometryInstance({
      geometry: ellipseGeometry,
    });

    const primitive = new Cesium.Primitive({
      geometryInstances: geometryInstance,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: material,
        aboveGround: true,
      }),
      asynchronous: false,
    });

    this.viewer.scene.primitives.add(primitive);
    this.primitives.set(id, primitive);

    return primitive;
  }

  /**
   * Create a heatmap gradient effect
   */
  createHeatmap(
    id: string,
    bounds: {
      west: number;
      south: number;
      east: number;
      north: number;
    },
    options: {
      intensity?: number;
      gradient?: string[];
    } = {}
  ): Cesium.Primitive {
    const intensity = options.intensity ?? 1.0;
    const gradient = options.gradient ?? ["#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ff0000"];

    // Create gradient texture
    const gradientColors = gradient.map((c) => Cesium.Color.fromCssColorString(c));

    const material = this.createMaterial(id, {
      uniforms: {
        intensity: intensity,
        gradient0: gradientColors[0] ?? Cesium.Color.BLUE,
        gradient1: gradientColors[1] ?? Cesium.Color.CYAN,
        gradient2: gradientColors[2] ?? Cesium.Color.GREEN,
        gradient3: gradientColors[3] ?? Cesium.Color.YELLOW,
        gradient4: gradientColors[4] ?? Cesium.Color.RED,
        time: 0,
      },
      fragmentShaderSource: `
        uniform float intensity;
        uniform vec4 gradient0;
        uniform vec4 gradient1;
        uniform vec4 gradient2;
        uniform vec4 gradient3;
        uniform vec4 gradient4;
        uniform float time;
        
        vec4 getGradientColor(float t) {
          t = clamp(t, 0.0, 1.0);
          if (t < 0.25) return mix(gradient0, gradient1, t * 4.0);
          if (t < 0.5) return mix(gradient1, gradient2, (t - 0.25) * 4.0);
          if (t < 0.75) return mix(gradient2, gradient3, (t - 0.5) * 4.0);
          return mix(gradient3, gradient4, (t - 0.75) * 4.0);
        }
        
        czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material material = czm_getDefaultMaterial(materialInput);
          
          // Perlin-like noise for organic heatmap
          vec2 uv = materialInput.st;
          float noise = sin(uv.x * 10.0 + time) * cos(uv.y * 10.0) * 0.5 + 0.5;
          noise *= sin(uv.x * 20.0 - time * 0.5) * cos(uv.y * 20.0 + time * 0.3) * 0.5 + 0.5;
          
          vec4 heatColor = getGradientColor(noise * intensity);
          material.diffuse = heatColor.rgb;
          material.alpha = heatColor.a * 0.7;
          
          return material;
        }
      `,
    });

    // Animate
    const startTime = Date.now();
    const updateTime = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      material.uniforms.time = elapsed;
      requestAnimationFrame(updateTime);
    };
    updateTime();

    // Create rectangle primitive
    const rectangleGeometry = new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(
        bounds.west,
        bounds.south,
        bounds.east,
        bounds.north
      ),
      height: 1000,
    });

    const geometryInstance = new Cesium.GeometryInstance({
      geometry: rectangleGeometry,
    });

    const primitive = new Cesium.Primitive({
      geometryInstances: geometryInstance,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: material,
        aboveGround: true,
      }),
      asynchronous: false,
    });

    this.viewer.scene.primitives.add(primitive);
    this.primitives.set(id, primitive);

    return primitive;
  }

  /**
   * Create a flow line effect
   */
  createFlowLines(
    id: string,
    lines: Array<{
      start: { longitude: number; latitude: number };
      end: { longitude: number; latitude: number };
    }>,
    options: {
      color?: string;
      speed?: number;
      width?: number;
    } = {}
  ): Cesium.Primitive {
    const color = options.color ?? "#00ffff";
    const speed = options.speed ?? 1.0;
    const width = options.width ?? 5;

    const material = this.createMaterial(`${id}-material`, {
      uniforms: {
        color: Cesium.Color.fromCssColorString(color),
        speed: speed,
        time: 0,
      },
      fragmentShaderSource: `
        uniform vec4 color;
        uniform float speed;
        uniform float time;
        
        czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material material = czm_getDefaultMaterial(materialInput);
          
          float flow = fract(materialInput.st.s * 5.0 - time * speed);
          float alpha = smoothstep(0.0, 0.3, flow) * smoothstep(1.0, 0.7, flow);
          
          material.diffuse = color.rgb;
          material.alpha = alpha * color.a;
          material.emission = color.rgb * alpha * 0.5;
          
          return material;
        }
      `,
    });

    // Animate
    const startTime = Date.now();
    const updateTime = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      material.uniforms.time = elapsed;
      requestAnimationFrame(updateTime);
    };
    updateTime();

    // Create polyline geometry
    const instances: Cesium.GeometryInstance[] = [];

    for (const line of lines) {
      const positions = Cesium.Cartesian3.fromDegreesArray([
        line.start.longitude,
        line.start.latitude,
        line.end.longitude,
        line.end.latitude,
      ]);

      const polylineGeometry = new Cesium.PolylineGeometry({
        positions,
        width,
        vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
      });

      instances.push(
        new Cesium.GeometryInstance({
          geometry: polylineGeometry,
        })
      );
    }

    const primitive = new Cesium.Primitive({
      geometryInstances: instances,
      appearance: new Cesium.PolylineMaterialAppearance({
        material: material,
      }),
      asynchronous: false,
    });

    this.viewer.scene.primitives.add(primitive);
    this.primitives.set(id, primitive);

    return primitive;
  }

  /**
   * Create a scanline radar effect
   */
  createRadarScan(
    id: string,
    longitude: number,
    latitude: number,
    options: {
      radius?: number;
      color?: string;
      speed?: number;
    } = {}
  ): Cesium.Primitive {
    const radius = options.radius ?? 100000;
    const color = options.color ?? "#00ff00";
    const speed = options.speed ?? 1.0;

    const material = this.createMaterial(id, {
      uniforms: {
        color: Cesium.Color.fromCssColorString(color),
        speed: speed,
        time: 0,
      },
      fragmentShaderSource: `
        uniform vec4 color;
        uniform float speed;
        uniform float time;
        
        czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material material = czm_getDefaultMaterial(materialInput);
          
          vec2 center = vec2(0.5);
          vec2 uv = materialInput.st - center;
          float angle = atan(uv.y, uv.x);
          float dist = length(uv);
          
          float scanline = sin(angle * 1.0 + time * speed * 3.14159) * 0.5 + 0.5;
          float ring = smoothstep(0.48, 0.5, dist) * smoothstep(0.52, 0.5, dist);
          
          float alpha = scanline * ring * 0.5 + ring * 0.3;
          
          material.diffuse = color.rgb;
          material.alpha = alpha * color.a;
          material.emission = color.rgb * alpha;
          
          return material;
        }
      `,
    });

    // Animate
    const startTime = Date.now();
    const updateTime = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      material.uniforms.time = elapsed;
      requestAnimationFrame(updateTime);
    };
    updateTime();

    // Create ellipse
    const ellipseGeometry = new Cesium.EllipseGeometry({
      center: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      semiMajorAxis: radius,
      semiMinorAxis: radius,
      height: 1000,
    });

    const geometryInstance = new Cesium.GeometryInstance({
      geometry: ellipseGeometry,
    });

    const primitive = new Cesium.Primitive({
      geometryInstances: geometryInstance,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: material,
        aboveGround: true,
      }),
      asynchronous: false,
    });

    this.viewer.scene.primitives.add(primitive);
    this.primitives.set(id, primitive);

    return primitive;
  }

  /**
   * Remove a shader effect
   */
  remove(id: string): void {
    const primitive = this.primitives.get(id);
    if (primitive) {
      this.viewer.scene.primitives.remove(primitive);
      this.primitives.delete(id);
    }

    const material = this.materials.get(id);
    if (material) {
      material.destroy();
      this.materials.delete(id);
    }

    // Also remove associated materials
    const assocMaterial = this.materials.get(`${id}-material`);
    if (assocMaterial) {
      assocMaterial.destroy();
      this.materials.delete(`${id}-material`);
    }
  }

  /**
   * Remove all shader effects
   */
  removeAll(): void {
    this.primitives.forEach((primitive) => {
      this.viewer.scene.primitives.remove(primitive);
    });
    this.primitives.clear();

    this.materials.forEach((material) => {
      material.destroy();
    });
    this.materials.clear();
  }

  /**
   * Check if an effect exists
   */
  has(id: string): boolean {
    return this.primitives.has(id) || this.materials.has(id);
  }

  /**
   * Update material uniform
   */
  updateUniform(id: string, uniformName: string, value: unknown): void {
    const material = this.materials.get(id);
    if (material && material.uniforms) {
      (material.uniforms as Record<string, unknown>)[uniformName] = value;
    }
  }
}
