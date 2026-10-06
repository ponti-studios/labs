import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

const CELL = 14;
const FONT_SIZE = 12;
// Dim dots everywhere; heavier glyphs only where the field peaks.
const RAMP = ["·", "·", ":", "+", "*", "#"] as const;
const POINTER_RADIUS = 7; // in cells

type Pointer = { x: number; y: number; active: boolean };

/**
 * Decorative ASCII dot-field: a grid of mono glyphs whose weight follows a slow
 * interference of sine waves, with a ripple that follows the cursor. Reads its
 * color from `currentColor` (so it flips with the theme), renders a single
 * still frame under `prefers-reduced-motion`, and pauses while off-screen.
 */
export function AsciiField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const pointer: Pointer = { x: 0, y: 0, active: false };

    let cols = 0;
    let rows = 0;
    let color = "#000";
    let fontFamily = "monospace";
    let raf = 0;
    let visible = true;

    const readStyle = () => {
      const style = getComputedStyle(canvas);
      color = style.color;
      fontFamily = style.fontFamily;
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      readStyle();
      draw(performance.now());
    };

    const draw = (now: number) => {
      // Waves drift with time and, slightly, with scroll position.
      const t = reduceMotion.matches ? 0 : now / 1000 + window.scrollY * 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;

      const cx = cols * 0.7;
      const cy = rows * 0.5;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let v =
            Math.sin(i * 0.17 + t * 0.6) +
            Math.sin(j * 0.21 - t * 0.45) +
            Math.sin((i + j) * 0.11 + t * 0.3) +
            Math.sin(Math.hypot(i - cx, j - cy) * 0.22 - t * 0.8);
          v = (v / 4 + 1) / 2; // 0..1

          if (pointer.active) {
            const d = Math.hypot(i - pointer.x, j - pointer.y);
            v += Math.exp(-(d * d) / (POINTER_RADIUS * POINTER_RADIUS)) * 0.7;
          }

          const level = Math.min(RAMP.length - 1, Math.max(0, Math.floor(v * RAMP.length)));
          ctx.globalAlpha = 0.12 + (level / (RAMP.length - 1)) * 0.88;
          ctx.fillText(RAMP[level], i * CELL + CELL / 2, j * CELL + CELL / 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (visible && !document.hidden) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduceMotion.matches) raf = requestAnimationFrame(loop);
      else draw(0);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / CELL;
      const y = (e.clientY - rect.top) / CELL;
      pointer.x = x;
      pointer.y = y;
      pointer.active =
        x >= -POINTER_RADIUS &&
        x <= cols + POINTER_RADIUS &&
        y >= -POINTER_RADIUS &&
        y <= rows + POINTER_RADIUS;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onThemeChange = () => {
      readStyle();
      draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(canvas);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    reduceMotion.addEventListener("change", start);
    scheme.addEventListener("change", onThemeChange);
    // The mono web font may land after first paint; repaint once it does.
    void document.fonts?.ready.then(() => {
      readStyle();
      draw(performance.now());
    });

    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      reduceMotion.removeEventListener("change", start);
      scheme.removeEventListener("change", onThemeChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "text-foreground pointer-events-none absolute inset-0 -z-10 size-full font-mono",
        // Fade out under the headline (left) so type stays legible, and at the edges.
        "[mask-image:linear-gradient(to_right,transparent_38%,black_78%),linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]",
        className,
      )}
    />
  );
}
