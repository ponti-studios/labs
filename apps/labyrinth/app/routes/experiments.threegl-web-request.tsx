import { Button } from "@pontistudios/ui";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

type AnimationRuntime = {
  animationActive: boolean;
  requestPath: THREE.Vector3[];
  currentSegment: number;
  segmentProgress: number;
  cacheWriteActive: boolean;
  cacheWriteProgress: number;
};

const ANIMATION_SPEED = 1.0;

export default function ThreeglWebRequest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const startAnimationRef = useRef<() => void>(() => {});
  const resetAnimationRef = useRef<() => void>(() => {});
  const [simulateCacheHit, setSimulateCacheHit] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const simulateCacheHitRef = useRef(simulateCacheHit);
  const isRunningRef = useRef(isRunning);
  const runtimeRef = useRef<AnimationRuntime>({
    animationActive: false,
    requestPath: [],
    currentSegment: 0,
    segmentProgress: 0,
    cacheWriteActive: false,
    cacheWriteProgress: 0,
  });
  const sceneRefs = useRef<{
    requestSphere: THREE.Mesh | null;
    cacheWriteSphere: THREE.Mesh | null;
    client: THREE.Mesh | null;
    loadBalancer: THREE.Mesh | null;
    servers: THREE.Mesh[];
    cache: THREE.Mesh | null;
    database: THREE.Mesh | null;
    clock: THREE.Clock | null;
    renderer: THREE.WebGLRenderer | null;
    labelRenderer: CSS2DRenderer | null;
    camera: THREE.PerspectiveCamera | null;
    controls: OrbitControls | null;
    frameId: number | null;
  }>({
    requestSphere: null,
    cacheWriteSphere: null,
    client: null,
    loadBalancer: null,
    servers: [],
    cache: null,
    database: null,
    clock: null,
    renderer: null,
    labelRenderer: null,
    camera: null,
    controls: null,
    frameId: null,
  });

  useEffect(() => {
    simulateCacheHitRef.current = simulateCacheHit;
  }, [simulateCacheHit]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;
    const cleanupRef: {
      dispose?: () => void;
      removeDom?: () => void;
      removeResize?: () => void;
    } = {};

    const init = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const { CSS2DObject, CSS2DRenderer } =
        await import("three/examples/jsm/renderers/CSS2DRenderer.js");

      if (cancelled) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2a);
      scene.fog = new THREE.Fog(0x1a1a2a, 50, 150);

      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 20, 45);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(container.clientWidth, container.clientHeight);
      labelRenderer.domElement.style.position = "absolute";
      labelRenderer.domElement.style.top = "0";
      labelRenderer.domElement.style.left = "0";
      labelRenderer.domElement.style.pointerEvents = "none";
      container.appendChild(labelRenderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 10;
      controls.maxDistance = 100;
      controls.maxPolarAngle = Math.PI / 2 - 0.05;

      const addLabel = (object: THREE.Object3D, text: string, y = 2.5) => {
        const div = document.createElement("div");
        div.className = "rounded bg-black/70 px-2 py-1 text-xs whitespace-nowrap text-white";
        div.textContent = text;
        const label = new CSS2DObject(div);
        label.position.set(0, y, 0);
        object.add(label);
        return label;
      };

      const createBox = (name: string, color: number, position: THREE.Vector3) => {
        const geometry = new THREE.BoxGeometry(4, 4, 4);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        scene.add(mesh);
        addLabel(mesh, name);
        return mesh;
      };

      const createCylinder = (name: string, color: number, position: THREE.Vector3) => {
        const geometry = new THREE.CylinderGeometry(2, 2, 5, 32);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        scene.add(mesh);
        addLabel(mesh, name, geometry.parameters.height / 2 + 1.5);
        return mesh;
      };

      const spacing = 10;
      const clientPos = new THREE.Vector3(-spacing * 2.5, 0, 0);
      const lbPos = new THREE.Vector3(-spacing * 1.2, 0, 0);
      const server1Pos = new THREE.Vector3(spacing * 0.5, spacing * 0.5, 0);
      const server2Pos = new THREE.Vector3(spacing * 0.5, -spacing * 0.5, 0);
      const cachePos = new THREE.Vector3(spacing * 1.8, spacing * 0.5, 0);
      const dbPos = new THREE.Vector3(spacing * 1.8, -spacing * 0.5, 0);

      const clientGeo = new THREE.SphereGeometry(2.5, 32, 16);
      const clientMat = new THREE.MeshStandardMaterial({
        color: 0x0077cc,
        metalness: 0.4,
        roughness: 0.5,
      });
      const client = new THREE.Mesh(clientGeo, clientMat);
      client.position.copy(clientPos);
      scene.add(client);
      addLabel(client, "Client", clientGeo.parameters.radius + 1.5);

      const loadBalancer = createBox("Load Balancer", 0xffa500, lbPos);
      const server1 = createBox("Web Server 1", 0x00cc66, server1Pos);
      const server2 = createBox("Web Server 2", 0x00dd77, server2Pos);
      const cache = createBox("Cache", 0xcc00cc, cachePos);
      cache.scale.set(0.8, 0.8, 0.8);
      const database = createCylinder("Database", 0xcc4444, dbPos);

      const requestSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xffff00, toneMapped: false }),
      );
      requestSphere.visible = false;
      scene.add(requestSphere);

      const cacheWriteSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xff66ff, toneMapped: false }),
      );
      cacheWriteSphere.visible = false;
      scene.add(cacheWriteSphere);

      const definePath = () => {
        const path = [
          client.position.clone(),
          loadBalancer.position.clone(),
          server1.position.clone(),
        ];

        if (simulateCacheHitRef.current) {
          path.push(cache.position.clone(), server1.position.clone());
        } else {
          path.push(database.position.clone(), server1.position.clone());
        }

        path.push(loadBalancer.position.clone(), client.position.clone());
        runtimeRef.current.requestPath = path;
      };

      const resetAnimation = () => {
        runtimeRef.current.animationActive = false;
        runtimeRef.current.currentSegment = 0;
        runtimeRef.current.segmentProgress = 0;
        runtimeRef.current.cacheWriteActive = false;
        runtimeRef.current.cacheWriteProgress = 0;
        requestSphere.visible = false;
        cacheWriteSphere.visible = false;
        if (isRunningRef.current) {
          setIsRunning(false);
        }
      };

      const startAnimation = () => {
        definePath();
        if (runtimeRef.current.requestPath.length < 2) return;

        requestSphere.position.copy(runtimeRef.current.requestPath[0]);
        requestSphere.visible = true;
        cacheWriteSphere.visible = false;
        runtimeRef.current.animationActive = true;
        runtimeRef.current.currentSegment = 0;
        runtimeRef.current.segmentProgress = 0;
        runtimeRef.current.cacheWriteActive = false;
        runtimeRef.current.cacheWriteProgress = 0;
        if (!isRunningRef.current) {
          setIsRunning(true);
        }
      };

      sceneRefs.current = {
        requestSphere,
        cacheWriteSphere,
        client,
        loadBalancer,
        servers: [server1, server2],
        cache,
        database,
        clock: new THREE.Clock(),
        renderer,
        labelRenderer,
        camera,
        controls,
        frameId: null,
      };

      const animate = () => {
        const state = runtimeRef.current;
        const refs = sceneRefs.current;
        const requestMesh = refs.requestSphere;
        const cacheWriteMesh = refs.cacheWriteSphere;
        const localCache = refs.cache;
        const localServer = refs.servers[0];
        const localClock = refs.clock;

        if (!requestMesh || !cacheWriteMesh || !localCache || !localServer || !localClock) {
          return;
        }

        refs.frameId = requestAnimationFrame(animate);

        const delta = localClock.getDelta();
        controls.update();

        if (
          state.animationActive &&
          state.requestPath.length > 1 &&
          state.currentSegment < state.requestPath.length - 1
        ) {
          const startPoint = state.requestPath[state.currentSegment];
          const endPoint = state.requestPath[state.currentSegment + 1];
          const segmentLength = startPoint.distanceTo(endPoint);
          const isServerToLoadBalancerSegment =
            !simulateCacheHitRef.current && state.currentSegment === state.requestPath.length - 3;

          if (isServerToLoadBalancerSegment && !state.cacheWriteActive && !cacheWriteMesh.visible) {
            state.cacheWriteActive = true;
            state.cacheWriteProgress = 0;
            cacheWriteMesh.position.copy(localServer.position);
            cacheWriteMesh.visible = true;
          }

          if (segmentLength > 0) {
            state.segmentProgress += (ANIMATION_SPEED * delta * 10) / segmentLength;

            if (state.segmentProgress >= 1.0) {
              requestMesh.position.copy(endPoint);
              state.currentSegment += 1;
              state.segmentProgress = 0;

              if (state.currentSegment >= state.requestPath.length - 1) {
                resetAnimation();
              }
            } else {
              requestMesh.position.lerpVectors(startPoint, endPoint, state.segmentProgress);
            }
          }
        }

        if (state.cacheWriteActive) {
          const startPoint = localServer.position;
          const endPoint = localCache.position;
          const segmentLength = startPoint.distanceTo(endPoint);

          if (segmentLength > 0) {
            state.cacheWriteProgress += (ANIMATION_SPEED * delta * 10) / segmentLength;

            if (state.cacheWriteProgress >= 1.0) {
              cacheWriteMesh.position.copy(endPoint);
              state.cacheWriteActive = false;
              cacheWriteMesh.visible = false;
            } else {
              cacheWriteMesh.position.lerpVectors(startPoint, endPoint, state.cacheWriteProgress);
            }
          } else {
            state.cacheWriteActive = false;
            cacheWriteMesh.visible = false;
          }
        }

        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      };

      const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        labelRenderer.setSize(width, height);
      };

      startAnimationRef.current = startAnimation;
      resetAnimationRef.current = resetAnimation;
      window.addEventListener("resize", handleResize);
      cleanupRef.removeResize = () => window.removeEventListener("resize", handleResize);
      cleanupRef.dispose = () => {
        controls.dispose();
        renderer.dispose();
      };
      cleanupRef.removeDom = () => {
        labelRenderer.domElement.remove();
        renderer.domElement.remove();
      };

      animate();
    };

    void init();

    return () => {
      cancelled = true;
      cleanupRef.removeResize?.();
      if (sceneRefs.current.frameId) {
        cancelAnimationFrame(sceneRefs.current.frameId);
      }
      startAnimationRef.current = () => {};
      resetAnimationRef.current = () => {};
      cleanupRef.dispose?.();
      cleanupRef.removeDom?.();
    };
  }, []);

  const handleToggleAnimation = () => {
    if (isRunning) {
      resetAnimationRef.current();
    } else {
      startAnimationRef.current();
    }
  };

  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden bg-[#111] ">
      <div className="bg-card absolute top-4 right-4 z-50 max-w-72 rounded-lg p-3">
        <p className="ui-eyebrow mb-1">Web Request Flow</p>
        <p className="mb-3 text-sm">
          Visualise a request travelling through a load balancer, web server, cache, and database.
        </p>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={simulateCacheHit}
            onChange={(event) => setSimulateCacheHit(event.target.checked)}
          />
          Simulate Cache Hit
        </label>

        <div className="text-muted-foreground my-4 border-y py-3 text-xs">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-1 pr-3 font-medium">Client ↔ Server</td>
                <td className="py-1 text-right">Medium (WAN)</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-1 pr-3 font-medium">Server ↔ Cache</td>
                <td className="py-1 text-right">Very Fast (LAN)</td>
              </tr>
              <tr>
                <td className="py-1 pr-3 font-medium">Server ↔ Database</td>
                <td className="py-1 text-right">Fast (LAN)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button type="button" onClick={handleToggleAnimation}>
          {isRunning ? "Reset" : "Start Request"}
        </Button>
      </div>

      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
