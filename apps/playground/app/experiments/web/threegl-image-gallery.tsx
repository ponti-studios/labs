import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const imageUrls = [
  "https://placehold.co/600x400/F87171/white?text=Image+1",
  "https://placehold.co/600x400/FBBF24/white?text=Image+2",
  "https://placehold.co/600x400/34D399/white?text=Image+3",
  "https://placehold.co/600x400/60A5FA/white?text=Image+4",
  "https://placehold.co/600x400/A78BFA/white?text=Image+5",
  "https://placehold.co/600x400/F472B6/white?text=Image+6",
  "https://placehold.co/600x400/8B5CF6/white?text=Image+7",
  "https://placehold.co/600x400/10B981/white?text=Image+8",
];

const galleryRadius = 12;
const imageWidth = 6;
const imageHeight = 4;

export default function ThreeglImageGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.z = galleryRadius * 1.8;
    camera.position.y = 2;
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = galleryRadius * 3;
    controls.maxPolarAngle = Math.PI / 1.8;

    const photoGroup = new THREE.Group();
    scene.add(photoGroup);

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const textureLoader = new THREE.TextureLoader();
    const angleStep = (Math.PI * 2) / imageUrls.length;

    imageUrls.forEach((url, index) => {
      textureLoader.load(
        url,
        (texture) => {
          const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geometry, material);

          const angle = index * angleStep;
          const x = galleryRadius * Math.cos(angle);
          const z = galleryRadius * Math.sin(angle);
          mesh.position.set(x, 0, z);

          mesh.lookAt(new THREE.Vector3(0, camera.position.y / 2, 0));
          photoGroup.add(mesh);

          loadedCount++;
          if (loadedCount === totalImages && loadingRef.current) {
            loadingRef.current.style.display = "none";
          }
        },
        undefined,
        () => {
          if (loadingRef.current) {
            loadingRef.current.textContent = "Error loading images.";
          }
        },
      );
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      <div ref={containerRef} className="w-full h-full" />
      <div
        ref={loadingRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700 text-lg z-10"
      >
        Loading Gallery...
      </div>
    </div>
  );
}
