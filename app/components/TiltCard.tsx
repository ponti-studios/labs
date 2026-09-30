import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

import { cn } from "~/lib/utils";

// Shared spring for both the tilt rotation and the hover/tap scale — keeps
// every physical card (ServiceChip, ProjectCard, …) feeling identical.
const TILT_SPRING_CONFIG = { stiffness: 300, damping: 25, mass: 0.5 };
const TILT_HOVER_TRANSITION = { type: "spring" as const, stiffness: 300, damping: 24 };
const TILT_WHILE_HOVER = { scale: 1.015, y: -6 };
const TILT_WHILE_TAP = { scale: 0.98 };

const MotionLink = motion.create(Link);
const MotionAnchor = motion.create("a");

export type TiltCardGlow = {
  /** Color mixed into the pointer-following glow — can be a CSS var. */
  color?: string;
  /** Radius of the glow, in px. */
  radiusPx?: number;
  /** Percent of `color` mixed into the gradient's center. */
  opacityPercent?: number;
  /** Percent along the gradient where it fades to transparent. */
  fadeEndPercent?: number;
};

type TiltCardOwnProps = {
  /** Max tilt at the card's edges — subtle, not a gimbal. */
  tiltDegrees?: number;
  glow?: TiltCardGlow;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "data-testid"?: string;
};

type TiltCardLinkProps = TiltCardOwnProps & {
  href?: undefined;
  isExternal?: undefined;
  to: LinkProps["to"];
  prefetch?: LinkProps["prefetch"];
};

type TiltCardAnchorProps = TiltCardOwnProps & {
  to?: undefined;
  href: string;
  isExternal: true;
};

export type TiltCardProps = TiltCardLinkProps | TiltCardAnchorProps;

/** A "physical" card: tilts and glows toward the pointer, then springs back. */
export function TiltCard({
  tiltDegrees = 5,
  glow: {
    color: glowColor = "var(--color-accent)",
    radiusPx: glowRadiusPx = 220,
    opacityPercent: glowOpacityPercent = 24,
    fadeEndPercent: glowFadeEndPercent = 68,
  } = {},
  className,
  style,
  children,
  ...rest
}: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(pointerY, [0, 1], [tiltDegrees, -tiltDegrees]),
    TILT_SPRING_CONFIG,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [0, 1], [-tiltDegrees, tiltDegrees]),
    TILT_SPRING_CONFIG,
  );
  const glowX = useTransform(pointerX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(pointerY, [0, 1], ["0%", "100%"]);
  const glowBackground = useMotionTemplate`radial-gradient(${glowRadiusPx}px circle at ${glowX} ${glowY}, color-mix(in oklab, ${glowColor} ${glowOpacityPercent}%, transparent), transparent ${glowFadeEndPercent}%)`;

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  const sharedProps = {
    onPointerMove: reduceMotion ? undefined : handlePointerMove,
    onPointerLeave: reduceMotion ? undefined : handlePointerLeave,
    style: {
      ...(reduceMotion ? {} : { rotateX, rotateY, transformPerspective: 800 }),
      ...style,
    } as CSSProperties,
    whileHover: reduceMotion ? undefined : TILT_WHILE_HOVER,
    whileTap: reduceMotion ? undefined : TILT_WHILE_TAP,
    transition: TILT_HOVER_TRANSITION,
    className: cn("group relative isolate overflow-hidden", className),
  };

  const glow = !reduceMotion && (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: glowBackground }}
    />
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, isExternal, ...anchorRest } = rest;
    return (
      <MotionAnchor
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        {...anchorRest}
        {...sharedProps}
      >
        {glow}
        {children}
      </MotionAnchor>
    );
  }

  const { to, prefetch, ...linkRest } = rest as TiltCardLinkProps;
  return (
    <MotionLink to={to} prefetch={prefetch} {...linkRest} {...sharedProps}>
      {glow}
      {children}
    </MotionLink>
  );
}
