import { cn } from "~/lib/utils";
import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type GlassDisplacements = { red: number; green: number; blue: number };

/**
 * Converts a desired pixel refraction amount into feDisplacementMap scale values,
 * one per RGB channel, with a small spread between them to simulate chromatic aberration.
 * `max_shift = scale * 0.5`, so `scale = refractionPx * 2`.
 */
export function computeDisplacements(refractionPx: number, aberrationPx = 2): GlassDisplacements {
  const toScale = (px: number) => px / 0.5;

  return {
    red: toScale(refractionPx - aberrationPx), // least refraction (longest wavelength)
    green: toScale(refractionPx),
    blue: toScale(refractionPx + aberrationPx), // most refraction (shortest wavelength)
  };
}

const isChromium = typeof navigator !== "undefined" && /Chrome\//.test(navigator.userAgent);

interface DisplacementMapConfig {
  width: number;
  height: number;
  radius: number;
  /** Largest of the three channel scales — determines how much padding the map needs. */
  maxScale: number;
  /** Neutral-center inset, as a fraction of min(width, height). */
  border: number;
  /** Center blur radius, in px. */
  blur: number;
  lightness: number;
  alpha: number;
}

interface DisplacementMap {
  uri: string;
  padX: number;
  padY: number;
}

const mapCache = new Map<string, DisplacementMap>();

/**
 * Builds a displacement map via Canvas 2D: a black rounded-rect base with a
 * red left-right gradient (X displacement) and a blue top-bottom gradient
 * blended with "difference" (Y displacement, combined without erasing red),
 * topped by a blurred, near-opaque center so the middle of the glass stays
 * calm while refraction concentrates at the edges.
 *
 * The canvas is padded by `maxDisplace = max(maxScale * 0.5, 20)` on every
 * side and filled with neutral gray (128,128,128 = zero displacement) there.
 * feDisplacementMap can shift a pixel by up to half its scale, and SVG filters
 * hard-clip at the filter region's edge — without this padding (and without
 * widening the filter region to match, see `regionPercent` below), shifted
 * pixels and the glass's own rounded corners get clipped unevenly. This is a
 * well-documented SVG-filter gotcha for displacement-based effects; the
 * canvas-based map (vs. nesting nine differently-sized `<rect>` shapes in
 * separate feImage layers) is what keeps the padding pixel-exact.
 * Reference: https://github.com/rizroze/liquid-glass
 */
function buildDisplacementMap(c: DisplacementMapConfig): DisplacementMap {
  const key = `${c.width}:${c.height}:${c.radius}:${c.maxScale}:${c.border}:${c.blur}:${c.lightness}:${c.alpha}`;
  const cached = mapCache.get(key);
  if (cached) return cached;

  const maxDisplace = Math.max(c.maxScale * 0.5, 20);
  const padX = Math.ceil(maxDisplace);
  const padY = Math.ceil(maxDisplace);
  const totalW = c.width + padX * 2;
  const totalH = c.height + padY * 2;

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { uri: "", padX, padY };

  // Neutral gray everywhere — zero displacement outside the glass shape.
  ctx.fillStyle = "rgb(128, 128, 128)";
  ctx.fillRect(0, 0, totalW, totalH);

  const ox = padX;
  const oy = padY;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ox, oy, c.width, c.height, c.radius);
  ctx.clip();

  ctx.fillStyle = "#000000";
  ctx.fillRect(ox, oy, c.width, c.height);

  // Red channel: right-to-left gradient drives X-axis displacement.
  const redGrad = ctx.createLinearGradient(ox + c.width, oy, ox, oy);
  redGrad.addColorStop(0, "#000000");
  redGrad.addColorStop(1, "#ff0000");
  ctx.fillStyle = redGrad;
  ctx.fillRect(ox, oy, c.width, c.height);

  // Blue channel: top-to-bottom gradient drives Y-axis displacement.
  // "difference" blend layers this onto the red gradient without erasing it,
  // giving a correct two-axis displacement field from one canvas pass.
  ctx.globalCompositeOperation = "difference";
  const blueGrad = ctx.createLinearGradient(ox, oy, ox, oy + c.height);
  blueGrad.addColorStop(0, "#000000");
  blueGrad.addColorStop(1, "#0000ff");
  ctx.fillStyle = blueGrad;
  ctx.fillRect(ox, oy, c.width, c.height);

  // Center neutralization: a blurred, near-opaque rect flattens the middle
  // back toward neutral gray, so refraction reads as an edge phenomenon.
  ctx.globalCompositeOperation = "source-over";
  const borderPx = Math.min(c.width, c.height) * (c.border * 0.5);
  ctx.filter = `blur(${c.blur}px)`;
  ctx.fillStyle = `hsla(0, 0%, ${c.lightness}%, ${c.alpha})`;
  ctx.beginPath();
  ctx.roundRect(
    ox + borderPx,
    oy + borderPx,
    c.width - borderPx * 2,
    c.height - borderPx * 2,
    c.radius,
  );
  ctx.fill();

  ctx.restore();

  const result: DisplacementMap = { uri: canvas.toDataURL(), padX, padY };
  mapCache.set(key, result);
  return result;
}

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
      in="SourceGraphic"
      in2="map"
      xChannelSelector="R"
      yChannelSelector="B"
      scale={scale}
    />
    <feColorMatrix type="matrix" values={CHANNEL_MATRICES[channel]} result={result} />
  </>
);

export type LiquidGlassProps = {
  /** Per-channel feDisplacementMap scale, e.g. from computeDisplacements(). */
  displacements?: GlassDisplacements;
  /** Starting offset from the container's center, in px. */
  initialPosition?: { x: number; y: number };
  /** CSS size (any valid `width`/`height` value, e.g. "220px" or "clamp(120px, 40vw, 220px)"). */
  size?: string;
  /** Corner radius, in px. */
  radius?: number;
  className?: string;
  "data-testid"?: string;
};

/**
 * A draggable liquid-glass surface. Applies an SVG displacement filter as a
 * `backdrop-filter`, so it refracts whatever actually sits behind it on the
 * page (not just its own fill) — real optical distortion, not a fake blur.
 * Chromium-only (backdrop-filter: url() isn't supported elsewhere); other
 * browsers fall back to a plain frosted blur.
 */
export function LiquidGlass({
  displacements = computeDisplacements(20, 2),
  initialPosition = { x: 0, y: 0 },
  size = "clamp(120px, 40vw, 220px)",
  radius = 25,
  className,
  "data-testid": dataTestId,
}: LiquidGlassProps) {
  const filterId = `liquid-glass-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const elRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [map, setMap] = useState<DisplacementMap | null>(null);

  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startMouseX: 0,
    startMouseY: 0,
  });

  // Measure the actual rendered size — `size` can be a responsive CSS value
  // (e.g. clamp(...)), and the displacement map needs real pixel dimensions.
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDims({ width: Math.round(width), height: Math.round(height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxScale = Math.max(
    Math.abs(displacements.red),
    Math.abs(displacements.green),
    Math.abs(displacements.blue),
  );

  useEffect(() => {
    if (!isChromium || dims.width === 0 || dims.height === 0) return;
    setMap(
      buildDisplacementMap({
        width: dims.width,
        height: dims.height,
        radius,
        maxScale,
        border: 0.5,
        blur: 12,
        lightness: 50,
        alpha: 0.5,
      }),
    );
  }, [dims.width, dims.height, radius, maxScale]);

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

      // Non-passive touchmove: without preventDefault the browser treats the
      // gesture as a page scroll instead of a drag, so the glass never moves.
      if ("touches" in e) e.preventDefault();

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

  // Filter region must expand to cover the displacement map's own padding —
  // otherwise the browser clips the filter's output at the element's plain
  // bounding box regardless of how big the displacement map itself is.
  const regionPercentX = map && dims.width ? Math.ceil((map.padX / dims.width) * 100) : 10;
  const regionPercentY = map && dims.height ? Math.ceil((map.padY / dims.height) * 100) : 10;

  const backdropFilter = map?.uri ? `url(#${filterId})` : "blur(10px)";

  return (
    <>
      {/* Always rendered (even on non-Chromium / during SSR) so hydration sees
          the same DOM structure client and server side — only `backdropFilter`
          below actually decides whether this filter gets referenced. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x={`-${regionPercentX}%`}
            y={`-${regionPercentY}%`}
            width={`${100 + regionPercentX * 2}%`}
            height={`${100 + regionPercentY * 2}%`}
          >
            <feImage href={map?.uri} result="map" preserveAspectRatio="none" />
            <ChannelDisplacement scale={displacements.red} result="red" channel="red" />
            <ChannelDisplacement scale={displacements.green} result="green" channel="green" />
            <ChannelDisplacement scale={displacements.blue} result="blue" channel="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" />
          </filter>
        </defs>
      </svg>
      <div
        ref={elRef}
        data-testid={dataTestId}
        role="button"
        tabIndex={0}
        aria-label="Draggable glass effect"
        style={{
          position: "absolute",
          left: `calc(50% + ${position.x}px)`,
          top: `calc(50% + ${position.y}px)`,
          transform: "translate(-50%, -50%)",
          cursor: isDragging ? "grabbing" : "grab",
          width: size,
          height: size,
          borderRadius: radius,
          border: "1.5px solid rgba(255, 255, 255, 0.35)",
          background: "rgba(255, 255, 255, 0.06)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          willChange: isDragging ? "transform" : "auto",
          touchAction: "none",
        }}
        className={cn("z-50", className)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
    </>
  );
}
