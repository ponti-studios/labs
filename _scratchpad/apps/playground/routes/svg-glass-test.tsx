import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '~/lib/utils';

const DISPLACEMENT_FILTER_ID = 'displacementFilter4';

export default function SVGGlassTest() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [displacements, setDisplacements] = useState({
    red: -148,
    green: -150,
    blue: -152,
  });
  const [showControls, setShowControls] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState('');
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startMouseX: 0,
    startMouseY: 0,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragRef.current = {
        startX: position.x,
        startY: position.y,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
      };
    },
    [position.x, position.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragRef.current.startMouseX;
      const deltaY = e.clientY - dragRef.current.startMouseY;

      setPosition({
        x: dragRef.current.startX + deltaX,
        y: dragRef.current.startY + deltaY,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden pt-16"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Instructions */}
      <div className="absolute top-4 right-4 z-50 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm max-w-sm">
        <h3 className="font-semibold mb-2">Draggable Glass Effect</h3>
        <p className="text-sm text-white/80 mb-3">
          Click and drag the glass overlay to move it around the image. Add a custom background
          image URL or drag & drop a URL into the input field. The glass effect creates chromatic
          aberration and distortion.
        </p>
        <button
          type="button"
          onClick={() => setShowControls(!showControls)}
          className="px-3 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
        >
          {showControls ? 'Hide' : 'Show'} Controls
        </button>
      </div>

      {/* Displacement Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm min-w-80">
          <h3 className="font-semibold mb-3">Controls</h3>

          {/* Background Image URL Input */}
          <div className="mb-4 pb-3 border-b border-white/20">
            <label htmlFor="background-url" className="block text-sm mb-2 font-medium">
              Background Image URL
            </label>
            <input
              id="background-url"
              type="url"
              placeholder="https://example.com/image.jpg or drag & drop URL"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              onDrop={(e) => {
                e.preventDefault();
                const url = e.dataTransfer.getData('text/plain');
                if (url.startsWith('http')) {
                  setBackgroundImage(url);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setBackgroundImage('')}
                className="px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() =>
                  setBackgroundImage(
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
                  )
                }
                className="px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
              >
                Sample Image
              </button>
            </div>
          </div>

          {/* Displacement Controls */}
          <h4 className="font-medium mb-3">Displacement Settings</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="red-displacement" className="block text-sm mb-1">
                Red Channel: {displacements.red}
              </label>
              <input
                id="red-displacement"
                type="range"
                min="-300"
                max="300"
                value={displacements.red}
                onChange={(e) =>
                  setDisplacements((prev) => ({
                    ...prev,
                    red: Number.parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-2 bg-red-500/50 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="green-displacement" className="block text-sm mb-1">
                Green Channel: {displacements.green}
              </label>
              <input
                id="green-displacement"
                type="range"
                min="-300"
                max="300"
                value={displacements.green}
                onChange={(e) =>
                  setDisplacements((prev) => ({
                    ...prev,
                    green: Number.parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-2 bg-green-500/50 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="blue-displacement" className="block text-sm mb-1">
                Blue Channel: {displacements.blue}
              </label>
              <input
                id="blue-displacement"
                type="range"
                min="-300"
                max="300"
                value={displacements.blue}
                onChange={(e) =>
                  setDisplacements((prev) => ({
                    ...prev,
                    blue: Number.parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-2 bg-blue-500/50 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="pt-2 border-t border-white/20">
              <button
                type="button"
                onClick={() => setDisplacements({ red: -148, green: -150, blue: -152 })}
                className="px-3 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors mr-2"
              >
                Reset to Default
              </button>
              <button
                type="button"
                onClick={() => setDisplacements({ red: 0, green: 0, blue: 0 })}
                className="px-3 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
              >
                No Effect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Large Background Image - Using a colorful pattern or custom image */}
      <div className="absolute inset-0 w-full h-full">
        {backgroundImage ? (
          /* Custom background image */
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/20">
              {/* Text content over custom image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Glass Effect Test</h1>
                  <p className="text-2xl drop-shadow-lg">
                    Drag the glass overlay around this custom background
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4 text-lg">
                    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                      <h3 className="font-bold">Red Channel</h3>
                      <p>Displacement {displacements.red}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                      <h3 className="font-bold">Green Channel</h3>
                      <p>Displacement {displacements.green}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                      <h3 className="font-bold">Blue Channel</h3>
                      <p>Displacement {displacements.blue}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default colorful pattern background */
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-50">
              <PatternedBackground />
            </div>

            {/* Text content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">Glass Effect Test</h1>
                <p className="text-2xl drop-shadow-md">
                  Drag the glass overlay around this colorful background
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 text-lg">
                  <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                    <h3 className="font-bold">Red Channel</h3>
                    <p>Displacement {displacements.red}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                    <h3 className="font-bold">Green Channel</h3>
                    <p>Displacement {displacements.green}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                    <h3 className="font-bold">Blue Channel</h3>
                    <p>Displacement {displacements.blue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional visual elements */}
            <div className="absolute top-1/2 left-1/6 w-24 h-64 bg-yellow-400/50 rounded-full transform -rotate-12" />
          </div>
        )}
      </div>

      {/* SVG Filter Definition */}
      <div style={{ position: 'absolute', top: '-999px', left: '-999px' }}>
        <DisplacementFilter displacements={displacements} />
      </div>

      {/* Draggable Glass Overlay */}
      <div
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className="absolute size-[200px] z-[90]"
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backdropFilter: `url(#${DISPLACEMENT_FILTER_ID})`,
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        />
        {/* Drag handle indicator */}
        <div className="absolute top-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded pointer-events-none">
          Drag me
        </div>
      </div>
    </div>
  );
}

const PatternedBackground = () => {
  return (
    <div className="grid grid-cols-8 h-full">
      {Array.from({ length: 64 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: This is a static array for visual pattern, index is stable.
          key={`static-pattern-${i}`}
          className={cn({
            'bg-red-500': i % 8 === 0,
            'bg-orange-500': i % 8 === 1,
            'bg-yellow-500': i % 8 === 2,
            'bg-green-500': i % 8 === 3,
            'bg-blue-500': i % 8 === 4,
            'bg-indigo-500': i % 8 === 5,
            'bg-purple-500': i % 8 === 6,
            'bg-pink-500': i % 8 === 7,
          })}
        />
      ))}
    </div>
  );
};

const DisplacementFilter = ({
  displacements,
}: { displacements: { red: number; green: number; blue: number } }) => {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <filter id={DISPLACEMENT_FILTER_ID}>
        <feImage
          href="data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='%230001' /%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='%23FFF' style='filter:blur(5px)' /%3E%3C/svg%3E"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          result="thing9"
        />
        <feImage
          href="data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='%23FFF1' style='filter:blur(15px)' /%3E%3C/svg%3E"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          result="thing0"
        />
        <feImage
          href="data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='%23000' /%3E%3C/svg%3E"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          result="thing1"
        />
        <feImage
          href="data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='gradient1' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23000'/%3E%3Cstop offset='100%25' stop-color='%2300F'/%3E%3C/linearGradient%3E%3ClinearGradient id='gradient2' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23000'/%3E%3Cstop offset='100%25' stop-color='%230F0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='200' height='200' rx='25' fill='%237F7F7F' /%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='%23000' /%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='url(%23gradient1)' style='mix-blend-mode: screen' /%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='url(%23gradient2)' style='mix-blend-mode: screen' /%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='%237F7F7FBB' style='filter:blur(5px)' /%3E%3C/svg%3E"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          result="thing2"
        />
        <feDisplacementMap
          in2="thing2"
          in="SourceGraphic"
          scale={displacements.red.toString()}
          xChannelSelector="B"
          yChannelSelector="G"
        />
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
          result="disp1"
        />
        <feDisplacementMap
          in2="thing2"
          in="SourceGraphic"
          scale={displacements.green.toString()}
          xChannelSelector="B"
          yChannelSelector="G"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
          result="disp2"
        />
        <feDisplacementMap
          in2="thing2"
          in="SourceGraphic"
          scale={displacements.blue.toString()}
          xChannelSelector="B"
          yChannelSelector="G"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
          result="disp3"
        />
        <feBlend in2="disp2" mode="screen" />
        <feBlend in2="disp1" mode="screen" />
        <feGaussianBlur stdDeviation="0.7" />
        <feBlend in2="thing0" mode="screen" />
        <feBlend in2="thing9" mode="multiply" />
        <feComposite in2="thing1" operator="in" />
        <feOffset dx="43" dy="43" />
      </filter>
    </svg>
  );
};
