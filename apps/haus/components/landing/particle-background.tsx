"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface ParticleBackgroundProps {
  className?: string;
  enabled?: boolean;
  particleCount?: number;
  maxLinkDistance?: number;
  attractRadius?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
}

interface Palette {
  particle: string;
  link: string;
}

const DEFAULT_PARTICLE_COUNT = 320;
const PARTICLE_DENSITY = 2800;
const EDGE_DIST = 90;
const ATTRACT_STRENGTH = 0.012;
const DEFAULT_ATTRACT_RADIUS = 180;

const PALETTES: Record<"light" | "dark", Palette> = {
  dark: {
    particle: "255,255,255",
    link: "255,255,255",
  },
  light: {
    particle: "15,23,42",
    link: "15,23,42",
  },
};

function useResolvedTheme() {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => setResolvedTheme(media.matches ? "dark" : "light");

    resolve();
    media.addEventListener("change", resolve);

    return () => {
      media.removeEventListener("change", resolve);
    };
  }, []);

  return resolvedTheme;
}

export function ParticleBackground({
  className,
  enabled = true,
  particleCount,
  maxLinkDistance = EDGE_DIST,
  attractRadius = DEFAULT_ATTRACT_RADIUS,
}: ParticleBackgroundProps) {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    if (prefersReduced) return;

    if (!enabled) return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const canvas = canvasEl;
    const context = ctx;

    const palette = PALETTES[resolvedTheme];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount =
        particleCount ??
        Math.max(80, Math.min(DEFAULT_PARTICLE_COUNT, Math.round((rect.width * rect.height) / PARTICLE_DENSITY)));

      particles.current = Array.from({ length: targetCount }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * (resolvedTheme === "dark" ? 0.045 : 0.035) + 0.02,
      }));
    }

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      context.clearRect(0, 0, width, height);

      const ps = particles.current;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        const mdx = mouse.current.x - p.x;
        const mdy = mouse.current.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < attractRadius) {
          const force = (1 - mdist / attractRadius) * ATTRACT_STRENGTH;
          p.vx += mdx * force;
          p.vy += mdy * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        context.beginPath();
        context.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        context.fillStyle = `rgba(${palette.particle},${p.opacity})`;
        context.fill();

        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxLinkDistance) {
            const alpha = (1 - dist / maxLinkDistance) * (resolvedTheme === "dark" ? 0.04 : 0.03);
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(q.x, q.y);
            context.strokeStyle = `rgba(${palette.link},${alpha})`;
            context.lineWidth = 0.5;
            context.stroke();
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [enabled, particleCount, maxLinkDistance, attractRadius, resolvedTheme, prefersReduced]);

  if (!enabled || prefersReduced) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            resolvedTheme === "dark"
              ? "radial-gradient(circle at top, rgba(255,255,255,0.08), rgba(255,255,255,0) 58%)"
              : "radial-gradient(circle at top, rgba(15,23,42,0.06), rgba(15,23,42,0) 58%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
