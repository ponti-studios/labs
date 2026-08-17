import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ponti-studios/ui/data-display";
import { Button, Label } from "@ponti-studios/ui/primitives";
import { cn } from "@ponti-studios/ui/utilities";
import { Input, Slider } from "@ponti-studios/ui/forms";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const DISPLACEMENT_FILTER_ID = "DISPLACEMENT_FILTER";

export function meta() {
  return [{ title: "Glassmorphism | Experiments" }];
}

export default function ExperimentsGlass() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [displacements, setDisplacements] = useState(() => computeDisplacements(20, 2));
  const [backgroundImage, setBackgroundImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
  );
  const [controlsOpen, setControlsOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startMouseX: 0,
    startMouseY: 0,
  });
  const sectionsRef = useRef<HTMLElement[]>([]);

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      dragRef.current = {
        startX: position.x,
        startY: position.y,
        startMouseX: clientX,
        startMouseY: clientY,
      };
    },
    [position.x, position.y],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleDragStart(e.clientX, e.clientY);
    },
    [handleDragStart],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleDragStart(touch.clientX, touch.clientY);
      }
    },
    [handleDragStart],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY;

      if (clientX !== undefined && clientY !== undefined) {
        setPosition({
          x: dragRef.current.startX + clientX - dragRef.current.startMouseX,
          y: dragRef.current.startY + clientY - dragRef.current.startMouseY,
        });
      }
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove as EventListener);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove as EventListener, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove as EventListener);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          let changed = false;
          const next = new Set(prev);

          entries.forEach((entry) => {
            const index = sectionsRef.current.indexOf(entry.target as HTMLElement);
            if (index < 0) return;

            const isVisible = next.has(index);
            if (entry.isIntersecting && !isVisible) {
              next.add(index);
              changed = true;
            } else if (!entry.isIntersecting && isVisible) {
              next.delete(index);
              changed = true;
            }
          });

          return changed ? next : prev;
        });
      },
      { threshold: 0.1 },
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-slate-950 text-white">
      {/* Interactive Glass Section */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Controls panel — Mobile: bottom sheet, Desktop: sidebar */}
        <div
          className={cn(
            "bg-card z-50 rounded-lg transition-all duration-300",
            // Mobile: bottom sheet
            "fixed right-0 bottom-0 left-0 md:absolute md:top-4 md:right-4 md:bottom-auto",
            "w-full md:w-auto md:max-w-72",
            "max-h-[60vh] overflow-y-auto md:max-h-none md:overflow-visible",
            "rounded-t-lg rounded-b-none md:rounded-lg md:rounded-b-lg",
            "p-4 md:p-3",
            "border-t border-slate-700 md:border-t-0",
            // Show/hide logic
            controlsOpen ? "translate-y-0" : "translate-y-full md:translate-y-0",
          )}
        >
          {/* Mobile close button */}
          <button
            onClick={() => setControlsOpen(false)}
            className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-200 md:hidden"
            aria-label="Close controls"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <p className="text-muted-foreground mb-1 text-xs font-medium">Glass Effect</p>
          <p className="mb-3 text-sm">
            Drag the glass overlay to view chromatic aberration using SVG displacement maps.
          </p>

          <div className="space-y-2 py-2">
            <label htmlFor="background-url" className="text-muted-foreground text-xs">
              Background
            </label>
            <div className="flex gap-2">
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
              <Button onClick={() => setBackgroundImage("")}>Clear</Button>
            </div>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="displacement">
              <AccordionTrigger>Displacement</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {(
                  [
                    { channel: "red", color: "bg-red-500", label: "Red" },
                    { channel: "green", color: "bg-green-500", label: "Green" },
                    { channel: "blue", color: "bg-blue-500", label: "Blue" },
                  ] as const
                ).map(({ channel, color, label }) => (
                  <div key={channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={channel}
                        className="text-muted-foreground flex items-center gap-2"
                      >
                        <span className={cn("inline-block size-2 rounded-full", color)} />
                        {label}
                      </Label>
                      <span className="text-muted-foreground text-sm tabular-nums">
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
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDisplacements(computeDisplacements(20, 2))}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDisplacements({ red: 0, green: 0, blue: 0 })}
                  >
                    No Effect
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div
          data-testid="background-image"
          className="absolute inset-0 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Mobile: Controls toggle button */}
        <button
          onClick={() => setControlsOpen(!controlsOpen)}
          className={cn(
            "fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform transition-all md:hidden",
            controlsOpen ? "pointer-events-none opacity-0" : "opacity-100",
            "flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700",
          )}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Settings
        </button>

        {/* Draggable Glass SVG — Responsive sizing */}
        <svg
          data-testid="glass-svg"
          role="button"
          tabIndex={0}
          viewBox="0 0 220 220"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Draggable glass effect"
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: "translate(-50%, -50%)",
            cursor: isDragging ? "grabbing" : "grab",
            overflow: "visible",
            width: "clamp(120px, 40vw, 220px)",
            height: "clamp(120px, 40vw, 220px)",
            willChange: isDragging ? "transform" : "auto",
          }}
          className="absolute z-50 rounded-lg"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <defs>
            <GlassFilter displacements={displacements} />
          </defs>
          {/* The glass surface — applies the filter and shows the refracted background */}
          <rect
            x="10"
            y="10"
            width="200"
            height="200"
            rx="25"
            ry="25"
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.5"
            filter={`url(#${DISPLACEMENT_FILTER_ID})`}
            style={{ backdropFilter: "blur(8px)" }}
          />
        </svg>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse">
          <div className="text-center text-sm text-slate-400">
            <p className="mb-2">Scroll to learn more</p>
            <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Technical Essay Section */}
      <div className="relative min-h-screen w-full bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-24">
          {/* Hero Section */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                The{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Physics of Glass
                </span>
              </h1>
              <p className="text-base text-slate-300 sm:text-lg md:text-xl">
                How SVG filters recreate the refraction, dispersion, and light behavior of real
                glass
              </p>
            </div>

            <div className="mx-auto max-w-2xl rounded-xl border border-slate-700 bg-slate-900/50 p-6 backdrop-blur sm:p-8">
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Glass is not a solid in the classical sense—it's a supercooled liquid in a solid
                state. When light passes through it, the atoms bend and refract the light rays,
                creating the effects we see: distortion, color separation, and the illusion of
                depth. In this essay, we'll explore how to simulate these phenomena using nothing
                but SVG filters and a little mathematics.
              </p>
            </div>
          </div>

          {/* Section 1: Refraction Basics */}
          <section
            ref={(el) => {
              if (el) sectionsRef.current[0] = el;
            }}
            className={cn("space-y-6 sm:space-y-8", visibleSections.has(0) ? "visible" : "")}
          >
            <div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-3xl">
                Part 1: Refraction & Snell's Law
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
            </div>

            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                When light travels from one medium to another (air to glass, or glass to air), it
                bends according to <strong>Snell's Law</strong>:
              </p>

              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 font-mono">
                <p className="text-cyan-300">n₁ × sin(θ₁) = n₂ × sin(θ₂)</p>
                <p className="mt-2 text-sm text-slate-400">
                  where <em>n</em> is the refractive index and <em>θ</em> is the angle from the
                  normal
                </p>
              </div>

              <p className="leading-relaxed text-slate-300">
                The <strong>refractive index</strong> of common glass is about 1.5, while air is
                1.0. This difference causes light to bend when crossing the boundary. The greater
                the angle of incidence, the more dramatic the bending.
              </p>

              <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/30 p-4 sm:p-8">
                <svg
                  viewBox="0 0 400 300"
                  className="mx-auto w-full max-w-md"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ fontSize: "clamp(10px, 3vw, 14px)" }}
                >
                  {/* Glass surface */}
                  <line
                    x1="50"
                    y1="150"
                    x2="350"
                    y2="150"
                    stroke="rgba(148,163,184,0.5)"
                    strokeWidth="2"
                  />
                  <text x="360" y="155" fontSize="12" fill="rgba(148,163,184,0.7)">
                    Glass Surface
                  </text>

                  {/* Air side (top) */}
                  <text x="20" y="80" fontSize="12" fill="rgba(148,163,184,0.7)">
                    Air (n=1.0)
                  </text>

                  {/* Glass side (bottom) */}
                  <text x="20" y="220" fontSize="12" fill="rgba(148,163,184,0.7)">
                    Glass (n=1.5)
                  </text>

                  {/* Incident ray */}
                  <line
                    x1="200"
                    y1="50"
                    x2="200"
                    y2="150"
                    stroke="rgba(34,197,94,0.8)"
                    strokeWidth="2"
                  />
                  <circle cx="200" cy="50" r="4" fill="rgba(34,197,94,0.8)" />

                  {/* Normal line */}
                  <line
                    x1="200"
                    y1="140"
                    x2="200"
                    y2="160"
                    stroke="rgba(156,163,175,0.5)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />

                  {/* Refracted ray */}
                  <line
                    x1="200"
                    y1="150"
                    x2="260"
                    y2="250"
                    stroke="rgba(59,130,246,0.8)"
                    strokeWidth="2"
                  />
                  <circle cx="260" cy="250" r="4" fill="rgba(59,130,246,0.8)" />

                  {/* Angle annotations */}
                  <text x="210" y="120" fontSize="11" fill="rgba(34,197,94,0.8)">
                    θ₁
                  </text>
                  <text x="210" y="180" fontSize="11" fill="rgba(59,130,246,0.8)">
                    θ₂
                  </text>
                </svg>
              </div>

              <p className="leading-relaxed text-slate-300">
                In our SVG implementation, we use{" "}
                <code className="rounded bg-slate-800 px-2 py-1 font-mono text-cyan-300">
                  feDisplacementMap
                </code>{" "}
                to simulate this bending. Instead of calculating actual rays, we shift pixel
                coordinates based on a displacement map—effectively creating the illusion of
                refraction.
              </p>
            </div>
          </section>

          {/* Section 2: Chromatic Aberration */}
          <section
            ref={(el) => {
              if (el) sectionsRef.current[1] = el;
            }}
            className={cn("space-y-8", visibleSections.has(1) ? "visible" : "")}
          >
            <div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Part 2: Chromatic Aberration</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
            </div>

            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                Real glass doesn't refract all colors equally. Shorter wavelengths (blue light)
                refract more than longer wavelengths (red light). This phenomenon is called{" "}
                <strong>dispersion</strong>, and it's why prisms split white light into rainbows.
              </p>

              <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/30 p-4 sm:p-8">
                <svg
                  viewBox="0 0 400 200"
                  className="mx-auto w-full max-w-md"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ fontSize: "clamp(10px, 3vw, 14px)" }}
                >
                  {/* White light entering prism */}
                  <line
                    x1="50"
                    y1="100"
                    x2="100"
                    y2="100"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                  />
                  <circle cx="40" cy="100" r="5" fill="rgba(255,255,255,0.8)" />

                  {/* Prism shape */}
                  <polygon
                    points="100,50 100,150 200,100"
                    fill="rgba(59,130,246,0.1)"
                    stroke="rgba(59,130,246,0.5)"
                    strokeWidth="2"
                  />

                  {/* Red ray (least refraction) */}
                  <line
                    x1="200"
                    y1="100"
                    x2="330"
                    y2="70"
                    stroke="rgba(239,68,68,0.8)"
                    strokeWidth="2"
                  />
                  <circle cx="340" cy="65" r="4" fill="rgba(239,68,68,0.8)" />

                  {/* Green ray (medium refraction) */}
                  <line
                    x1="200"
                    y1="100"
                    x2="330"
                    y2="100"
                    stroke="rgba(34,197,94,0.8)"
                    strokeWidth="2"
                  />
                  <circle cx="340" cy="100" r="4" fill="rgba(34,197,94,0.8)" />

                  {/* Blue ray (most refraction) */}
                  <line
                    x1="200"
                    y1="100"
                    x2="330"
                    y2="130"
                    stroke="rgba(59,130,246,0.8)"
                    strokeWidth="2"
                  />
                  <circle cx="340" cy="135" r="4" fill="rgba(59,130,246,0.8)" />

                  {/* Labels */}
                  <text x="345" y="62" fontSize="11" fill="rgba(239,68,68,0.8)">
                    Red
                  </text>
                  <text x="345" y="120" fontSize="11" fill="rgba(34,197,94,0.8)">
                    Green
                  </text>
                  <text x="345" y="155" fontSize="11" fill="rgba(59,130,246,0.8)">
                    Blue
                  </text>
                </svg>
              </div>

              <p className="leading-relaxed text-slate-300">
                To simulate this in SVG, we apply <strong>three displacement passes</strong>—one for
                each RGB channel—using slightly different scale values. The displacement map stays
                the same, but we extract and manipulate each color channel independently:
              </p>

              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 font-mono text-sm">
                <div className="space-y-2 text-slate-300">
                  <p>
                    <span className="text-red-400">red_scale</span> = refraction - aberration
                  </p>
                  <p>
                    <span className="text-green-400">green_scale</span> = refraction
                  </p>
                  <p>
                    <span className="text-blue-400">blue_scale</span> = refraction + aberration
                  </p>
                </div>
              </div>

              <p className="leading-relaxed text-slate-300">
                Each channel gets shifted by its own scale value, then they're recombined using
                screen blending. This creates the characteristic color fringing you see at the edges
                of the glass effect.
              </p>
            </div>
          </section>

          {/* Section 3: feDisplacementMap Mechanics */}
          <section
            ref={(el) => {
              if (el) sectionsRef.current[2] = el;
            }}
            className={cn("space-y-8", visibleSections.has(2) ? "visible" : "")}
          >
            <div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                Part 3: How feDisplacementMap Works
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
            </div>

            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                SVG's{" "}
                <code className="rounded bg-slate-800 px-2 py-1 font-mono text-cyan-300">
                  feDisplacementMap
                </code>{" "}
                is the core primitive that makes our glass effect possible. It works by looking up
                displacement values from a secondary image (the displacement map) and shifting
                source pixels based on those values.
              </p>

              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
                <p className="mb-4 font-mono text-sm text-cyan-300">
                  x' = x + scale × (displacement_value / 255 − 0.5)
                </p>
                <p className="text-sm text-slate-400">
                  For each output pixel at (x, y), look up the displacement map at that same
                  location. The pixel brightness (0–255) is normalized to −0.5–0.5 range, then
                  multiplied by the scale factor.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/30 p-6">
                  <h4 className="font-semibold text-slate-200">Dark pixels (value = 0)</h4>
                  <p className="text-sm text-slate-400">
                    Shift = scale × (0 − 0.5) = <strong>−scale / 2</strong> (leftward/upward)
                  </p>
                </div>
                <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/30 p-6">
                  <h4 className="font-semibold text-slate-200">Gray pixels (value = 127)</h4>
                  <p className="text-sm text-slate-400">
                    Shift = scale × (0.5 − 0.5) = <strong>0</strong> (no displacement)
                  </p>
                </div>
                <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/30 p-6">
                  <h4 className="font-semibold text-slate-200">Light pixels (value = 255)</h4>
                  <p className="text-sm text-slate-400">
                    Shift = scale × (1 − 0.5) = <strong>scale / 2</strong> (rightward/downward)
                  </p>
                </div>
              </div>

              <p className="leading-relaxed text-slate-300">
                In our implementation, the displacement map is a rounded rectangle: dark edges and
                blurred gray interior. This creates smooth, natural-looking refraction at the edges
                while leaving the center relatively undistorted.
              </p>
            </div>
          </section>

          {/* Section 4: Practical Implementation */}
          <section
            ref={(el) => {
              if (el) sectionsRef.current[3] = el;
            }}
            className={cn("space-y-8", visibleSections.has(3) ? "visible" : "")}
          >
            <div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                Part 4: Building the Glass Effect
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
            </div>

            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                Our glassmorphism effect is built in stages, each adding a layer of visual
                complexity:
              </p>

              <div className="space-y-3">
                {[
                  {
                    stage: "Stage 1: Load Layers",
                    desc: "We create four SVG images: surface highlights, edge glow, shape mask, and displacement map",
                    icon: "📦",
                  },
                  {
                    stage: "Stage 2: Chromatic Aberration",
                    desc: "Apply feDisplacementMap three times with different scales, extracting one RGB channel per pass",
                    icon: "🌈",
                  },
                  {
                    stage: "Stage 3: Recombine",
                    desc: "Screen-blend the three displaced channels back together to reconstruct the full-color image",
                    icon: "🔗",
                  },
                  {
                    stage: "Stage 4: Surface Effects",
                    desc: "Apply glow and highlights to simulate refracted light and glass surface sheen",
                    icon: "✨",
                  },
                  {
                    stage: "Stage 5: Composite",
                    desc: "Mask everything to the glass shape boundary using feComposite with the 'in' operator",
                    icon: "🎯",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 transition-all hover:border-cyan-500/50 hover:bg-slate-900/70"
                  >
                    <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <span className="text-lg">{item.icon}</span> {item.stage}
                    </p>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
                <p className="mb-3 font-mono text-sm text-cyan-300">
                  The Mathematics of Refraction
                </p>
                <div className="space-y-2 font-mono text-sm text-slate-300">
                  <p>
                    <span className="text-slate-500">
                      // Convert desired pixel refraction to scale values
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">
                      // The displacement map's neutral gray (127, 127, 127)
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">
                      // when shifted gives a maximum deviation of ±0.5
                    </span>
                  </p>
                  <p className="mt-2">
                    <span className="text-green-400">const</span>{" "}
                    <span className="text-cyan-300">toScale</span> ={" "}
                    <span className="text-orange-400">(px)</span> {"=>"}
                    <span className="text-blue-400"> px / 0.5</span>
                  </p>
                  <p>
                    <span className="text-green-400">const</span>{" "}
                    <span className="text-cyan-300">scale_red</span> ={" "}
                    <span className="text-blue-400">toScale(refraction - aberration)</span>
                  </p>
                  <p>
                    <span className="text-green-400">const</span>{" "}
                    <span className="text-cyan-300">scale_green</span> ={" "}
                    <span className="text-blue-400">toScale(refraction)</span>
                  </p>
                  <p>
                    <span className="text-green-400">const</span>{" "}
                    <span className="text-cyan-300">scale_blue</span> ={" "}
                    <span className="text-blue-400">toScale(refraction + aberration)</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Why This Matters */}
          <section
            ref={(el) => {
              if (el) sectionsRef.current[4] = el;
            }}
            className={cn("space-y-8", visibleSections.has(4) ? "visible" : "")}
          >
            <div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                Part 5: Why This Technique Matters
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
            </div>

            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                This approach demonstrates how fundamental physics can be baked into visual design.
                We're not using canvas blurs or CSS filters—we're building a physically plausible
                light simulation using pure SVG.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "No JavaScript Rendering",
                    desc: "The GPU handles all the math via SVG filters",
                  },
                  {
                    title: "Draggable in Real-time",
                    desc: "Update scales instantly without recalculating the entire effect",
                  },
                  {
                    title: "Reusable & Composable",
                    desc: "Chain multiple feFilters together for complex visual effects",
                  },
                  {
                    title: "Hardware Accelerated",
                    desc: "Modern browsers render SVG filters on the GPU",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                    <h4 className="mb-1 font-semibold text-slate-200">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6">
                <p className="text-slate-200">
                  <strong>The Takeaway:</strong> Great visual effects aren't magic—they're applied
                  physics. By understanding the underlying principles (Snell's Law, dispersion,
                  light blending), we can build stunning effects that feel real because they{" "}
                  <em>are</em> real (simulated).
                </p>
              </div>
            </div>
          </section>

          {/* Closing */}
          <div className="space-y-6 border-t border-slate-700 pt-12 text-center">
            <h3 className="text-xl font-bold sm:text-2xl">Ready to Experiment?</h3>
            <p className="text-slate-400">
              Scroll back up and try adjusting the RGB displacement sliders. Each channel shift
              simulates a different wavelength of light bending through the glass. Lower values =
              subtle refraction; higher values = dramatic chromatic aberration.
            </p>
            <p className="text-sm text-slate-500">
              Challenge: Can you recreate the color fringing of a real prism? Try setting red to
              -40, green to 0, and blue to +40.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        section {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-play-state: paused;
        }

        section.visible {
          animation-play-state: running;
        }

        section:nth-of-type(n+2).visible {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
}

/**
 * Converts a desired pixel refraction amount into feDisplacementMap scale values,
 * one per RGB channel, with a small spread between them to simulate chromatic aberration.
 *
 * HOW `feDisplacementMap` WORKS
 * ───────────────────────────
 * For every pixel (x, y) in the source image, `feDisplacementMap` looks up the
 * corresponding pixel in the displacement map and shifts the source pixel by:
 *
 *   x' = x + scale × (B_channel / 255 − 0.5)
 *   y' = y + scale × (G_channel / 255 − 0.5)
 *
 * The "−0.5" centres the range:
 *   - value of 0.5 (neutral gray, #7F7F7F) = no shift
 *   - values below 0.5 shift negative
 *   - values above 0.5 shift positive
 *
 * DERIVING `scale` FROM A DESIRED PIXEL SHIFT
 * ──────────────────────────────────────────
 * Our displacement map is filled with near-neutral gray (#7F7F7F ≈ 127/255 ≈ 0.498).
 * At transparent edges the channel value drops to 0, giving a maximum deviation of 0.5:
 *
 *   max_shift = scale × 0.5
 *   → scale = refractionPx / 0.5 = refractionPx × 2
 *
 * WHY THREE SLIGHTLY DIFFERENT SCALES
 * ─────────────────────────────────────
 * Real glass disperses light: short wavelengths (blue) refract more than long ones (red).
 * Giving each RGB channel a slightly different scale recreates that colour fringing.
 * `aberrationPx` controls the total spread between the red and blue channels.
 */
function computeDisplacements(
  refractionPx: number,
  aberrationPx = 2,
): { red: number; green: number; blue: number } {
  const toScale = (px: number) => px / 0.5; // max channel deviation is 0.5

  return {
    red: toScale(refractionPx - aberrationPx), // least refraction (longest wavelength)
    green: toScale(refractionPx),
    blue: toScale(refractionPx + aberrationPx), // most refraction (shortest wavelength)
  };
}

// Shared props for all feImage elements in the displacement filter
const FILTER_IMAGE_PROPS = { x: "0%", y: "0%", width: "100%", height: "100%" } as const;

// Color matrices that isolate a single RGB channel (alpha row is always preserved)
const CHANNEL_MATRICES = {
  red: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  green: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  blue: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
} as const;

const ChannelDisplacement = ({
  scale,
  result,
  channel,
}: {
  scale: number;
  result: string;
  channel: keyof typeof CHANNEL_MATRICES;
}) => (
  <>
    <feDisplacementMap
      in2="dispMap"
      in="SourceGraphic"
      scale={scale.toString()}
      xChannelSelector="B"
      yChannelSelector="G"
    />
    <feColorMatrix type="matrix" values={CHANNEL_MATRICES[channel]} result={result} />
  </>
);

interface FilterRect {
  // Fill color. Use a hex string (e.g. "#FFF") or "none" for a stroke-only rect.
  fill: string;
  // Optional stroke color. Produces a visible outline without affecting the fill area.
  stroke?: string;
  // Optional CSS blur radius in px, applied via style="filter:blur(Xpx)".
  // Blur is rendered before compositing, so it bleeds outside the rect boundary.
  blur?: number;
}

/**
 * Builds a URL-encoded SVG data URI for use as an feImage href.
 *
 * All filter layer SVGs share:
 *   - A fixed 200×200 canvas with a 220×220 viewBox (extra space absorbs blur bleed)
 *   - A single rounded-rectangle shape: x=0 y=0 w=220 h=220 rx=8
 *
 * Multiple rects are layered in order (first = bottom).
 */
function makeFilterSvg(rects: FilterRect[]): string {
  const rectMarkup = rects
    .map(({ fill, stroke, blur }) => {
      const strokeAttr = stroke ? ` stroke='${stroke}'` : "";
      const styleAttr = blur != null ? ` style='filter:blur(${blur}px)'` : "";
      return `<rect x='0' y='0' width='220' height='220' rx='8' fill='${fill}'${strokeAttr}${styleAttr} />`;
    })
    .join("");

  // Compact — no extra whitespace so the encoded URI stays short
  const svg = `<svg width='200' height='200' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'>${rectMarkup}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Glass surface highlight: near-invisible dark tint + soft white glow, used with multiply blend
const FILTER_HREF_HIGHLIGHT = makeFilterSvg([{ fill: "#0001" }, { fill: "#FFF", blur: 5 }]);

// Outer glow: heavily blurred near-transparent white, used with screen blend after gaussian blur
const FILTER_HREF_GLOW = makeFilterSvg([{ fill: "#FFF1", blur: 15 }]);

// Shape mask: solid black rect used as the composite `in` operator boundary
const FILTER_HREF_MASK = makeFilterSvg([{ fill: "#000" }]);

// Displacement map source: gray outline edge + blurred gray interior drives the refraction vectors
const FILTER_HREF_DISPLACEMENT = makeFilterSvg([
  { fill: "none", stroke: "#7F7F7F" },
  { fill: "#7F7F7FBB", blur: 5 },
]);

const GlassFilter = ({
  displacements,
}: {
  displacements: { red: number; green: number; blue: number };
}) => (
  <filter id={DISPLACEMENT_FILTER_ID} x="0%" y="0%" width="100%" height="100%">
    {/* --- Stage 1: Load texture layers --- */}
    {/* Surface shimmer: dark tint + soft white glow; composited last via multiply */}
    <feImage {...FILTER_IMAGE_PROPS} href={FILTER_HREF_HIGHLIGHT} result="highlight" />
    {/* Edge glow: heavily blurred white; adds bright halo of refracted light */}
    <feImage {...FILTER_IMAGE_PROPS} href={FILTER_HREF_GLOW} result="glow" />
    {/* Shape mask: solid black rect; used to clip the final output to the glass boundary */}
    <feImage {...FILTER_IMAGE_PROPS} href={FILTER_HREF_MASK} result="mask" />
    {/* Displacement map: gray rounded-rect edge + blurred fill; gray 0x7F7F7F = no shift, lighter = push right/down, darker = push left/up */}
    <feImage {...FILTER_IMAGE_PROPS} href={FILTER_HREF_DISPLACEMENT} result="dispMap" />

    {/* --- Stage 2: Chromatic aberration — each channel displaced by a slightly different amount --- */}
    {/* Displace SourceGraphic using dispMap, then strip to red channel only */}
    <ChannelDisplacement scale={displacements.red} result="red-displacement" channel="red" />
    {/* Same displacement pass at a different scale, strip to green only */}
    <ChannelDisplacement scale={displacements.green} result="green-displacement" channel="green" />
    {/* Same for blue; left as implicit `in` for the next blend */}
    <ChannelDisplacement scale={displacements.blue} result="blue-displacement" channel="blue" />

    {/* --- Stage 3: Recombine the aberrated channels --- */}
    {/* Screen blue (implicit in=blue-displacement) with green: screen adds both without over-brightening */}
    <feBlend in2="green-displacement" mode="screen" />
    {/* Screen the blue+green mix with red to reconstruct a full-color image with split-channel offsets */}
    <feBlend in2="red-displacement" mode="screen" />
    {/* Subtle blur softens the color fringing at the displaced edges */}
    <feGaussianBlur stdDeviation="0.7" />

    {/* --- Stage 4: Surface appearance --- */}
    {/* Screen the edge glow over the blurred image: brightens the rim to simulate refracted light */}
    <feBlend in2="glow" mode="screen" />
    {/* Multiply the highlight (dark tint + inner glow) to add depth and a glass-surface sheen */}
    <feBlend in2="highlight" mode="multiply" />

    {/* --- Stage 5: Clip and position --- */}
    {/* Composite with the solid-black mask using "in": discards everything outside the glass shape */}
    <feComposite in2="mask" operator="in" />
  </filter>
);
