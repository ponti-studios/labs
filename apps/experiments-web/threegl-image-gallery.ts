<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGL Photo Gallery (Three.js)</title>
    <style>
        /* Basic styling */
        body {
            margin: 0;
            overflow: hidden; /* Prevent scrollbars */
            font-family: 'Inter', sans-serif; /* Use Inter font */
            background-color: #f0f0f0; /* Light background */
        }
        /* Style for the container */
        #webgl-container {
            width: 100vw;
            height: 100vh;
            display: block;
        }
        /* Style for loading text */
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            font-size: 1.2em;
            z-index: 10; /* Ensure it's above the canvas */
        }
    </style>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div id="webgl-container"></div>
    <div id="loading">Loading Gallery...</div>

    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/"
            }
        }
    </script>

    <script type="module">
        // Import necessary Three.js components
        import * as THREE from 'three';
        // Import OrbitControls for camera interaction
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- Global Variables ---
        let scene, camera, renderer, controls;
        let photoGroup; // Group to hold all photo meshes
        let loadingManager;
        let loadingElement;

        // --- Image Configuration ---
        const imageUrls = [
            'https://placehold.co/600x400/F87171/white?text=Image+1', // Red
            'https://placehold.co/600x400/FBBF24/white?text=Image+2', // Amber
            'https://placehold.co/600x400/34D399/white?text=Image+3', // Emerald
            'https://placehold.co/600x400/60A5FA/white?text=Image+4', // Blue
            'https://placehold.co/600x400/A78BFA/white?text=Image+5', // Violet
            'https://placehold.co/600x400/F472B6/white?text=Image+6', // Pink
            'https://placehold.co/600x400/8B5CF6/white?text=Image+7', // Purple
            'https://placehold.co/600x400/10B981/white?text=Image+8'  // Teal
        ];
        const galleryRadius = 12; // Radius of the circle layout
        const imageWidth = 6;   // Width of the plane geometry for images
        const imageHeight = 4;  // Height of the plane geometry for images

        // --- Initialization ---
        function init() {
            // Get the container element
            const container = document.getElementById('webgl-container');
            loadingElement = document.getElementById('loading');

            // --- Scene Setup ---
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0); // Match body background

            // --- Camera Setup ---
            const aspect = window.innerWidth / window.innerHeight;
            camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
            camera.position.z = galleryRadius * 1.8; // Position camera outside the circle
            camera.position.y = 2; // Slightly elevated view
            camera.lookAt(scene.position); // Look at the center

            // --- Renderer Setup ---
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio); // Adjust for high-DPI screens
            container.appendChild(renderer.domElement);

            // --- Controls Setup ---
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // Smooth camera movement
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false; // Panning relative to camera position
            controls.minDistance = 5;       // Prevent zooming too close
            controls.maxDistance = galleryRadius * 3; // Prevent zooming too far
            controls.maxPolarAngle = Math.PI / 1.8; // Limit vertical rotation

            // --- Group for Photos ---
            // Using a group makes rotating the entire gallery easier if needed later
            photoGroup = new THREE.Group();
            scene.add(photoGroup);

            // --- Loading Manager ---
            // To know when all textures are loaded
            loadingManager = new THREE.LoadingManager();
            loadingManager.onLoad = () => {
                console.log('All images loaded!');
                loadingElement.style.display = 'none'; // Hide loading text
                 // Start the animation loop only after everything is loaded
                 animate();
            };
            loadingManager.onError = (url) => {
                console.error('There was an error loading ' + url);
                 // Optionally show an error message to the user
                 loadingElement.textContent = 'Error loading images.';
            };

            // --- Load Textures and Create Meshes ---
            const textureLoader = new THREE.TextureLoader(loadingManager);
            const angleStep = (Math.PI * 2) / imageUrls.length; // Angle between images

            imageUrls.forEach((url, index) => {
                textureLoader.load(
                    url,
                    // onLoad callback (called when texture is ready)
                    (texture) => {
                        // Create geometry (a flat plane)
                        const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);

                        // Create material using the loaded texture
                        // MeshBasicMaterial doesn't require lights
                        const material = new THREE.MeshBasicMaterial({
                            map: texture,
                            side: THREE.DoubleSide // Show texture on both sides of the plane
                        });

                        // Create the mesh (geometry + material)
                        const mesh = new THREE.Mesh(geometry, material);

                        // Calculate position in a circle
                        const angle = index * angleStep;
                        const x = galleryRadius * Math.cos(angle);
                        const z = galleryRadius * Math.sin(angle);
                        mesh.position.set(x, 0, z);

                        // Make the plane face the center of the scene (0, 0, 0)
                        mesh.lookAt(new THREE.Vector3(0, camera.position.y / 2, 0)); // Look slightly down towards center

                        // Add the mesh to the group
                        photoGroup.add(mesh);
                    },
                    // onProgress callback (optional)
                    undefined,
                    // onError callback (handled by LoadingManager)
                    undefined
                );
            });

            // --- Event Listeners ---
            window.addEventListener('resize', onWindowResize, false);
        }

        // --- Handle Window Resize ---
        function onWindowResize() {
            // Update camera aspect ratio
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix(); // Apply changes

            // Update renderer size
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // --- Animation Loop ---
        function animate() {
            // Request the next frame
            requestAnimationFrame(animate);

            // Update controls (needed for damping)
            controls.update();

            // Optional: Add subtle rotation to the gallery
            // photoGroup.rotation.y += 0.001;

            // Render the scene from the camera's perspective
            renderer.render(scene, camera);
        }

        // --- Start Everything ---
        init();

    </script>
</body>
</html>
