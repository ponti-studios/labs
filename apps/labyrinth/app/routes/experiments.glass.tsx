import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@pontistudios/ui/data-display";
import { Button, Label } from "@pontistudios/ui/primitives";
import { cn } from "@pontistudios/ui/utilities";
import { Input, Slider } from "@pontistudios/ui/forms";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const DISPLACEMENT_FILTER_ID = "DISPLACEMENT_FILTER";

export default function ExperimentsGlass() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [displacements, setDisplacements] = useState(() => computeDisplacements(20, 2));
  const [backgroundImage, setBackgroundImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
  );
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

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      setPosition({
        x: dragRef.current.startX + e.clientX - dragRef.current.startMouseX,
        y: dragRef.current.startY + e.clientY - dragRef.current.startMouseY,
      });
    };
    const onUp = () => setIsDragging(false);

    /**
     * Attach move/up to window so fast drags don't lose tracking
     * when the cursor outruns the element
     */
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  return (
    <div className="relative h-[calc(100vh-150px)] w-full overflow-hidden rounded-3xl">
      {/* Controls panel */}
      <div className="bg-panel absolute top-4 right-4 z-50 max-w-72 rounded-lg p-3">
        <p className="text-secondary mb-1 text-xs font-medium">Glass Effect</p>
        <p className="mb-3 text-sm">
          Drag the glass overlay to view a chromatic aberration using SVG displacement maps.
        </p>

        <div className="space-y-2 py-2">
          <label htmlFor="background-url" className="text-secondary text-xs">
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
                      className="text-secondary flex items-center gap-2"
                    >
                      <span className={cn("inline-block size-2 rounded-full", color)} />
                      {label}
                    </Label>
                    <span className="text-secondary text-sm tabular-nums">
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

      {/* Draggable Glass SVG */}
      <svg
        data-testid="glass-svg"
        role="button"
        tabIndex={0}
        width="200"
        height="200"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Draggable glass effect"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
          backdropFilter: `url(#${DISPLACEMENT_FILTER_ID})`,
        }}
        className="absolute z-90 rounded-lg border"
        onMouseDown={handleMouseDown}
      >
        <defs>
          <GlassFilter displacements={displacements} />
        </defs>
      </svg>
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
 *   - A single rounded-rectangle shape: x=50 y=50 w=100 h=100 rx=25
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
