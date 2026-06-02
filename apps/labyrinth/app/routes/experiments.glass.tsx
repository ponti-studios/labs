import { Button, cn, Input, Label, Slider, Tag } from "@pontistudios/ui";
import type React from "react";
import { useCallback, useRef, useState } from "react";

const DISPLACEMENT_FILTER_ID = "DISPLACEMENT_FILTER";

export default function ExperimentsGlass() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [displacements, setDisplacements] = useState({
    red: -148,
    green: -150,
    blue: -152,
  });
  const [showControls, setShowControls] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("");
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
    [position.x, position.y],
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
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden pt-16 rounded-3xl">
      {/* SVG Filter Definition */}
      <DisplacementFilter displacements={displacements} />

      {/* Instructions */}
      <div className="absolute top-4 right-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 max-w-xs">
        <p className="ui-eyebrow mb-3">Draggable Glass Effect</p>
        <p className="text-sm text-muted-foreground mb-3">
          Click and drag the glass overlay to move it around the painting. The glass effect creates
          chromatic aberration and distortion.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? "Hide" : "Show"} Controls
        </Button>
      </div>

      {/* Displacement Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-4 z-50 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 min-w-72">
          <p className="ui-eyebrow mb-4">Controls</p>

          {/* Background Image URL */}
          <div className="mb-4 pb-4 border-b border-border space-y-2">
            <Label htmlFor="background-url">Background Image URL</Label>
            <Input
              id="background-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              onDrop={(e) => {
                e.preventDefault();
                const url = e.dataTransfer.getData("text/plain");
                if (url.startsWith("http")) setBackgroundImage(url);
              }}
              onDragOver={(e) => e.preventDefault()}
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setBackgroundImage("")}>
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setBackgroundImage(
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
                  )
                }
              >
                Sample Image
              </Button>
            </div>
          </div>

          {/* Displacement sliders */}
          <p className="ui-eyebrow mb-3">Displacement</p>
          <div className="space-y-4">
            {(
              [
                { channel: "red", color: "bg-red-500", label: "Red" },
                {
                  channel: "green",
                  color: "bg-green-500",
                  label: "Green",
                },
                { channel: "blue", color: "bg-blue-500", label: "Blue" },
              ] as const
            ).map(({ channel, color, label }) => (
              <div key={channel} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={channel}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <span className={cn("size-2 rounded-full inline-block", color)} />
                    {label}
                  </Label>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {displacements[channel]}
                  </span>
                </div>
                <Slider
                  id={channel}
                  min={-300}
                  max={300}
                  value={[displacements[channel]]}
                  onValueChange={([val]) =>
                    setDisplacements((prev) => ({ ...prev, [channel]: val }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDisplacements({ red: -148, green: -150, blue: -152 })}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDisplacements({ red: 0, green: 0, blue: 0 })}
            >
              No Effect
            </Button>
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
                  <h1 className="mb-4 drop-shadow-2xl">Glass Effect Test</h1>
                  <p className="text-2xl drop-shadow-lg">
                    Drag the glass overlay around this custom background
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4 text-lg">
                    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                      <h3>Red Channel</h3>
                      <p>Displacement {displacements.red}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                      <h3>Green Channel</h3>
                      <p>Displacement {displacements.green}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                      <h3>Blue Channel</h3>
                      <p>Displacement {displacements.blue}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default: Raphael's School of Athens (1509–1511) — public domain */
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg)`,
            }}
          />
        )}
      </div>

      {/* Draggable Glass Overlay */}
      <button
        type="button"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        className="absolute size-50 z-90"
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="w-full h-full rounded-lg border"
          style={{
            backdropFilter: `url(#${DISPLACEMENT_FILTER_ID})`,
          }}
        />
        {/* Drag handle indicator */}
        <Tag className="absolute top-2 left-2 pointer-events-none">Drag me</Tag>
      </button>
    </div>
  );
}

const DisplacementFilter = ({
  displacements,
}: {
  displacements: { red: number; green: number; blue: number };
}) => {
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
          href="data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='none' stroke='%237F7F7F' /%3E%3Crect x='50' y='50' width='100' height='100' rx='25' fill='%237F7F7FBB' style='filter:blur(5px)' /%3E%3C/svg%3E"
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
