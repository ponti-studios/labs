import { Button, Slider } from "@pontistudios/ui";
import { useEffect, useRef, useState } from "react";
import type { Mesh, Vector3, Color, Clock, WebGLRenderer, PerspectiveCamera, Scene, MeshBasicMaterial } from "three";
import type { OrbitControls as OrbitControlsType } from "three/examples/jsm/controls/OrbitControls.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type Particle = {
  mesh: Mesh;
  startPos: Vector3;
  endPos: Vector3;
  progress: number;
  speed: number;
  layerIndex: number;
  phase: number;
};

type AnimationState = {
  running: boolean;
  particles: Particle[];
  layerMeshes: Mesh[];
  layerGlowIntensities: number[];
  clock: Clock | null;
  renderer: WebGLRenderer | null;
  camera: PerspectiveCamera | null;
  controls: OrbitControlsType | null;
  scene: Scene | null;
  frameId: number | null;
};

// ─── Module-level constants (no THREE dependency) ─────────────────────────────

const LAYER_COLORS = [0x4fc3f7, 0x29b6f6, 0x7e57c2, 0xab47bc, 0xec407a, 0xef5350];

// ─── Route Component ───────────────────────────────────────────────────────────

export default function ThreeglAiExplainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AnimationState>({
    running: false,
    particles: [],
    layerMeshes: [],
    layerGlowIntensities: [],
    clock: null,
    renderer: null,
    camera: null,
    controls: null,
    scene: null,
    frameId: null,
  });

  const [layerCount, setLayerCount] = useState(6);
  const [particleCount, setParticleCount] = useState(40);
  const [isRunning, setIsRunning] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const layerCountRef = useRef(layerCount);
  const particleCountRef = useRef(particleCount);
  const isRunningRef = useRef(isRunning);
  const speedRef = useRef(speedMultiplier);

  useEffect(() => { layerCountRef.current = layerCount; }, [layerCount]);
  useEffect(() => { particleCountRef.current = particleCount; }, [particleCount]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);

  // ── Three.js scene setup ──
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;
    const s = stateRef.current;
    const cleanup: { dispose?: () => void; removeResize?: () => void } = {};

    const init = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (cancelled) return;

      // ── Helpers (use dynamically imported THREE) ──

      function lerpColor(c1: Color, c2: Color, t: number): Color {
        return c1.clone().lerp(c2, t);
      }

      function buildLayers(
        scene: Scene,
        count: number,
        spacing: number,
      ): { meshes: Mesh[]; glowIntensities: number[] } {
        const meshes: Mesh[] = [];
        const glowIntensities: number[] = [];

        const totalWidth = (count - 1) * spacing;
        const startX = -totalWidth / 2;

        for (let i = 0; i < count; i++) {
          const color = LAYER_COLORS[i % LAYER_COLORS.length];

          const geo = new THREE.BoxGeometry(3.5, 3.5, 3.5);
          const mat = new THREE.MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: 0.4,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(startX + i * spacing, 0, 0);
          scene.add(mesh);
          meshes.push(mesh);

          // Inner glow fill
          const innerGeo = new THREE.BoxGeometry(3.2, 3.2, 3.2);
          const innerMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.05,
          });
          const innerMesh = new THREE.Mesh(innerGeo, innerMat);
          innerMesh.position.copy(mesh.position);
          scene.add(innerMesh);

          glowIntensities.push(0);
        }

        return { meshes, glowIntensities };
      }

      function spawnParticle(
        scene: Scene,
        layerPositions: Vector3[],
        layerIndex: number,
        phase: number,
      ): Particle {
        const startPos = layerPositions[layerIndex].clone();
        const endPos =
          layerIndex < layerPositions.length - 1
            ? layerPositions[layerIndex + 1].clone()
            : layerPositions[layerIndex].clone();

        startPos.y += (Math.random() - 0.5) * 2;
        startPos.z += (Math.random() - 0.5) * 2;
        endPos.y += (Math.random() - 0.5) * 2;
        endPos.z += (Math.random() - 0.5) * 2;

        const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: 0x4fc3f7,
          transparent: true,
          opacity: 0.9,
        });
        const mesh = new THREE.Mesh(particleGeo, particleMat);
        mesh.position.copy(startPos);
        scene.add(mesh);

        const progress = Math.min(phase, 1);
        mesh.position.lerpVectors(startPos, endPos, progress);

        return {
          mesh,
          startPos,
          endPos,
          progress,
          speed: 0.15 + Math.random() * 0.1,
          layerIndex,
          phase,
        };
      }

      // ── Scene setup ──

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a1a);
      scene.fog = new THREE.Fog(0x0a0a1a, 30, 60);
      s.scene = scene;

      const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        100,
      );
      camera.position.set(0, 8, 22);
      camera.lookAt(0, 0, 0);
      s.camera = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      s.renderer = renderer;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 8;
      controls.maxDistance = 50;
      controls.maxPolarAngle = Math.PI / 2.2;
      controls.target.set(0, 0, 0);
      s.controls = controls;

      // Lights
      const ambient = new THREE.AmbientLight(0x222244, 0.5);
      scene.add(ambient);

      const pointLight = new THREE.PointLight(0x8888ff, 1, 40);
      pointLight.position.set(0, 10, 10);
      scene.add(pointLight);

      // Ground grid
      const gridHelper = new THREE.GridHelper(30, 20, 0x444488, 0x222244);
      gridHelper.position.y = -3;
      scene.add(gridHelper);

      // Clock
      s.clock = new THREE.Clock();

      // ── Build layers ──
      const spacing = 4;
      const { meshes, glowIntensities } = buildLayers(scene, layerCountRef.current, spacing);
      s.layerMeshes = meshes;
      s.layerGlowIntensities = glowIntensities;

      // ── Spawn initial particles ──
      const layerPositions = meshes.map((m) => m.position.clone());
      const particles: Particle[] = [];
      for (let i = 0; i < particleCountRef.current; i++) {
        const layerIdx = Math.floor(Math.random() * Math.max(layerCountRef.current - 1, 1));
        const phase = Math.random();
        particles.push(spawnParticle(scene, layerPositions, layerIdx, phase));
      }
      s.particles = particles;

      // ── Connection lines between layers ──
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x444488,
        transparent: true,
        opacity: 0.15,
      });
      for (let i = 0; i < layerPositions.length - 1; i++) {
        const points = [
          new THREE.Vector3(layerPositions[i].x, layerPositions[i].y, layerPositions[i].z),
          new THREE.Vector3(
            layerPositions[i + 1].x,
            layerPositions[i + 1].y,
            layerPositions[i + 1].z,
          ),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
      }

      // ── Animation loop ──
      const animate = () => {
        if (cancelled) return;
        s.frameId = requestAnimationFrame(animate);

        const delta = s.clock!.getDelta();
        const speed = speedRef.current;

        for (const p of s.particles) {
          if (!isRunningRef.current) continue;

          p.progress += p.speed * delta * speed * 0.8;

          if (p.progress >= 1) {
            const nextLayer = (p.layerIndex + 1) % Math.max(layerCountRef.current - 1, 1);
            p.layerIndex = nextLayer;
            p.progress = 0;

            const layerPositions2 = s.layerMeshes.map((m) => m.position.clone());
            p.startPos.copy(layerPositions2[nextLayer]);
            p.startPos.y += (Math.random() - 0.5) * 2;
            p.startPos.z += (Math.random() - 0.5) * 2;

            const endIdx = Math.min(nextLayer + 1, layerPositions2.length - 1);
            p.endPos.copy(layerPositions2[endIdx]);
            p.endPos.y += (Math.random() - 0.5) * 2;
            p.endPos.z += (Math.random() - 0.5) * 2;

            // Trigger glow on the layer we passed through
            if (nextLayer > 0 && nextLayer - 1 < s.layerGlowIntensities.length) {
              s.layerGlowIntensities[nextLayer - 1] = 1;
            }
          }

          p.mesh.position.lerpVectors(p.startPos, p.endPos, p.progress);

          // Color shift based on layer depth
          const t2 = p.layerIndex / Math.max(layerCountRef.current - 1, 1);
          const baseColor = new THREE.Color(0x4fc3f7);
          const targetColor = new THREE.Color(0xef5350);
          const color = lerpColor(baseColor, targetColor, t2);
          (p.mesh.material as unknown as MeshBasicMaterial).color.copy(color);

          // Size pulse
          const pulse = 0.7 + 0.3 * Math.sin(p.progress * Math.PI);
          p.mesh.scale.setScalar(pulse);
        }

        // Layer glow decay
        for (let i = 0; i < s.layerGlowIntensities.length; i++) {
          s.layerGlowIntensities[i] *= 0.95;
          if (s.layerGlowIntensities[i] < 0.01) s.layerGlowIntensities[i] = 0;

          const wireframeMat = s.layerMeshes[i]?.material as unknown as MeshBasicMaterial;
          if (wireframeMat) {
            wireframeMat.opacity = 0.3 + s.layerGlowIntensities[i] * 0.7;
            const baseColor = LAYER_COLORS[i % LAYER_COLORS.length];
            const glowColor = new THREE.Color(baseColor);
            glowColor.lerp(new THREE.Color(0xffffff), s.layerGlowIntensities[i] * 0.5);
            wireframeMat.color.copy(glowColor);
          }
        }

        controls.update();
        s.renderer!.render(s.scene!, s.camera!);
      };

      animate();

      // ── Resize ──
      const handleResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);
      cleanup.removeResize = () => window.removeEventListener("resize", handleResize);
      cleanup.dispose = () => {
        controls.dispose();
        renderer.dispose();
      };
    };

    void init();

    return () => {
      cancelled = true;
      cleanup.removeResize?.();
      if (s.frameId) cancelAnimationFrame(s.frameId);
      cleanup.dispose?.();
      if (s.renderer && container.contains(s.renderer.domElement)) {
        container.removeChild(s.renderer.domElement);
      }
      s.particles.forEach((p) => {
        s.scene?.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as unknown as MeshBasicMaterial).dispose();
      });
      s.particles = [];
      s.layerMeshes.forEach((m) => {
        s.scene?.remove(m);
        m.geometry.dispose();
        (m.material as unknown as MeshBasicMaterial).dispose();
      });
      s.layerMeshes = [];
      s.clock = null;
      s.renderer = null;
      s.camera = null;
      s.controls = null;
      s.scene = null;
    };
  }, []);

  // ── Regenerate particles when controls change ──
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene || !s.layerMeshes.length) return;

    s.particles.forEach((p) => {
      s.scene?.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as unknown as MeshBasicMaterial).dispose();
    });

    // We need THREE for spawning — since we're in a separate effect, use the scene's
    // renderer to get the THREE reference. But we can't import it at module level.
    // Instead, we respawn particles inside the animation loop check or use a flag.
    // For simplicity, we just clear and let the next animation frame handle it.
    // Actually, the simplest approach: use the scene.background to test THREE is loaded.
    if (!s.scene) return;

    // We'll dynamically import THREE just for spawning
    const respawn = async () => {
      const THREE = await import("three");
      if (!s.scene || cancelledRef.current) return;

      // Remove old
      s.particles.forEach((p) => {
        s.scene?.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as unknown as MeshBasicMaterial).dispose();
      });

      const layerPositions = s.layerMeshes.map((m) => m.position.clone());
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        const layerIdx = Math.floor(Math.random() * Math.max(layerCount - 1, 1));

        const startPos = layerPositions[layerIdx].clone();
        const endPos =
          layerIdx < layerPositions.length - 1
            ? layerPositions[layerIdx + 1].clone()
            : layerPositions[layerIdx].clone();

        startPos.y += (Math.random() - 0.5) * 2;
        startPos.z += (Math.random() - 0.5) * 2;
        endPos.y += (Math.random() - 0.5) * 2;
        endPos.z += (Math.random() - 0.5) * 2;

        const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: 0x4fc3f7,
          transparent: true,
          opacity: 0.9,
        });
        const mesh = new THREE.Mesh(particleGeo, particleMat);
        mesh.position.copy(startPos);
        s.scene!.add(mesh);

        newParticles.push({
          mesh,
          startPos,
          endPos,
          progress: Math.random(),
          speed: 0.15 + Math.random() * 0.1,
          layerIndex: layerIdx,
          phase: Math.random(),
        });
      }
      s.particles = newParticles;
    };

    void respawn();
  }, [particleCount, layerCount]);

  const cancelledRef = useRef(false);
  useEffect(() => { cancelledRef.current = false; return () => { cancelledRef.current = true; }; }, []);

  const handleToggleRunning = () => setIsRunning((prev) => !prev);

  const handleReset = () => {
    const s = stateRef.current;
    if (!s.scene || !s.layerMeshes.length) return;

    const respawn = async () => {
      const THREE = await import("three");
      if (!s.scene) return;

      s.particles.forEach((p) => {
        s.scene?.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as unknown as MeshBasicMaterial).dispose();
      });

      const layerPositions = s.layerMeshes.map((m) => m.position.clone());
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        const layerIdx = Math.floor(Math.random() * Math.max(layerCount - 1, 1));

        const startPos = layerPositions[layerIdx].clone();
        const endPos =
          layerIdx < layerPositions.length - 1
            ? layerPositions[layerIdx + 1].clone()
            : layerPositions[layerIdx].clone();

        startPos.y += (Math.random() - 0.5) * 2;
        startPos.z += (Math.random() - 0.5) * 2;
        endPos.y += (Math.random() - 0.5) * 2;
        endPos.z += (Math.random() - 0.5) * 2;

        const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: 0x4fc3f7,
          transparent: true,
          opacity: 0.9,
        });
        const mesh = new THREE.Mesh(particleGeo, particleMat);
        mesh.position.copy(startPos);
        s.scene!.add(mesh);

        newParticles.push({
          mesh,
          startPos,
          endPos,
          progress: Math.random(),
          speed: 0.15 + Math.random() * 0.1,
          layerIndex: layerIdx,
          phase: Math.random(),
        });
      }
      s.particles = newParticles;
      setIsRunning(true);
    };

    void respawn();
  };

  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden bg-[#0a0a1a]">
      {/* Control panel */}
      <div className="bg-card/90 absolute top-4 right-4 z-50 max-w-72 rounded-lg border border-white/10 p-4 backdrop-blur-md">
        <p className="text-muted-foreground mb-1 text-xs font-medium">LLM Inference Engine</p>
        <p className="mb-4 text-sm leading-relaxed text-white/60">
          Watch token vectors flow through transformer layers — from embedding to output projection.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/60">Layers</label>
              <span className="text-xs font-medium text-white/80">{layerCount}</span>
            </div>
            <Slider
              min={2}
              max={8}
              step={1}
              value={[layerCount]}
              onValueChange={([v]) => setLayerCount(v)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/60">Particles (tokens)</label>
              <span className="text-xs font-medium text-white/80">{particleCount}</span>
            </div>
            <Slider
              min={10}
              max={120}
              step={5}
              value={[particleCount]}
              onValueChange={([v]) => setParticleCount(v)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/60">Speed</label>
              <span className="text-xs font-medium text-white/80">{speedMultiplier}x</span>
            </div>
            <Slider
              min={0.1}
              max={3}
              step={0.1}
              value={[speedMultiplier]}
              onValueChange={([v]) => setSpeedMultiplier(v)}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleToggleRunning}
          >
            {isRunning ? "Pause" : "Play"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
            <span>Token Embedding</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
            <span className="inline-block h-2 w-2 rounded-full bg-pink-400" />
            <span>Output Projection</span>
          </div>
          <p className="mt-2 text-xs text-white/30">
            Color shifts from cyan to pink as tokens pass through each layer.
          </p>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2 text-center">
        <p className="text-xs font-medium text-white/30">
          Drag to orbit &bull; Scroll to zoom
        </p>
      </div>

      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
