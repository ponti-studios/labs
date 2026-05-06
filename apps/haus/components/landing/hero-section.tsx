"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "../ui/magnetic-button";

// ---------------------------------------------------------------------------
// Particle field
// ---------------------------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
}

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 480;
    const EDGE_DIST = 90;
    const ATTRACT_RADIUS = 180;
    const ATTRACT_STRENGTH = 0.012;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function init() {
      if (!canvas) return;
      particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.045 + 0.02,
      }));
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ps = particles.current;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        // Mouse attraction
        const mdx = mouse.current.x - p.x;
        const mdy = mouse.current.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < ATTRACT_RADIUS) {
          const force = (1 - mdist / ATTRACT_RADIUS) * ATTRACT_STRENGTH;
          p.vx += mdx * force;
          p.vy += mdy * force;
        }

        // Dampen velocity
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();

        // Draw edges to nearby particles
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_DIST) {
            const alpha = (1 - dist / EDGE_DIST) * 0.04;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    init();
    draw();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };
    canvas.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Terminal typewriter
// ---------------------------------------------------------------------------

const TAGLINES = [
  "AI that actually lands.",
  "for founders who ship.",
  "for teams who refuse to compromise.",
];

function TerminalTitle({ title }: { title: string }) {
  const [phase, setPhase] = useState<"typing-title" | "blinking" | "cycling" | "settled">(
    "typing-title"
  );
  const [displayed, setDisplayed] = useState("");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineDisplayed, setTaglineDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const prefersReduced = useReducedMotion();

  // Blink cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Skip animation for reduced motion
  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(title);
      setTaglineDisplayed(TAGLINES[0]);
      setPhase("settled");
    }
  }, [prefersReduced, title]);

  // Phase: type title
  useEffect(() => {
    if (prefersReduced || phase !== "typing-title") return;
    if (displayed.length < title.length) {
      const id = setTimeout(
        () => setDisplayed(title.slice(0, displayed.length + 1)),
        38 + Math.random() * 22
      );
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setPhase("blinking"), 1400);
    return () => clearTimeout(id);
  }, [phase, displayed, title, prefersReduced]);

  // Phase: blink, then start cycling taglines
  useEffect(() => {
    if (prefersReduced || phase !== "blinking") return;
    const id = setTimeout(() => setPhase("cycling"), 1000);
    return () => clearTimeout(id);
  }, [phase, prefersReduced]);

  // Phase: cycle through taglines, type each one
  useEffect(() => {
    if (prefersReduced || phase !== "cycling") return;
    const target = TAGLINES[taglineIndex];
    if (taglineDisplayed.length < target.length) {
      const id = setTimeout(
        () => setTaglineDisplayed(target.slice(0, taglineDisplayed.length + 1)),
        28 + Math.random() * 18
      );
      return () => clearTimeout(id);
    }
    if (taglineIndex < TAGLINES.length - 1) {
      const id = setTimeout(() => {
        setTaglineDisplayed("");
        setTaglineIndex((i) => i + 1);
      }, 900);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setPhase("settled"), 800);
    return () => clearTimeout(id);
  }, [phase, taglineDisplayed, taglineIndex, prefersReduced]);

  const cursor = showCursor ? "_" : " ";

  return (
    <div className="space-y-4">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal uppercase tracking-[-0.04em] leading-[0.92]">
        {displayed}
        {phase === "typing-title" && (
          <span className="text-muted-foreground">{cursor}</span>
        )}
      </h1>
      {(phase === "cycling" || phase === "settled") && (
        <AnimatePresence mode="wait">
          <motion.p
            key={taglineIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground font-normal tracking-tight"
          >
            {taglineDisplayed}
            {phase === "cycling" && (
              <span>{cursor}</span>
            )}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------

interface HeroSectionProps {
  title: string;
  description: string;
  cta: string;
  ctaSecondary: string;
}

export function HeroSection({ title, description, cta, ctaSecondary }: HeroSectionProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      {!prefersReduced && <ParticleField />}

      <div className="container relative z-10 py-20 md:py-28">
        <div className="max-w-4xl space-y-10">
          <TerminalTitle title={title} />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <MagneticButton>
              <Link
                href="#contact"
                className="inline-block rounded-none bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
              >
                {cta}
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="#work"
                className="inline-block rounded-none border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
              >
                {ctaSecondary}
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
