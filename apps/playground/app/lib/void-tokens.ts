/**
 * VOID Design System Tokens
 * Based on four pillars: Kanso (simplicity), Ma (negative space),
 * Shibui (subtle complexity), Wabi-sabi (imperfection beauty)
 */

export const voidTokens = {
  // Color Palette - Monochromatic only
  color: {
    background: "#000000",
    foreground: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.1)",
    borderActive: "rgba(255, 255, 255, 0.2)",
    muted: "rgba(255, 255, 255, 0.05)",
    mutedText: "rgba(255, 255, 255, 0.6)",
  },

  // Spacing - Ma principle: generous whitespace
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
    xxxl: "4rem",
    ma: "16rem", // Major section spacing
  },

  // Typography - Monospace, uppercase, Geist Mono stack
  typography: {
    fontFamily: '"Geist Mono", "SF Mono", monospace',
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.25rem",
      xl: "1.5rem",
      xxl: "2rem",
    },
    fontWeight: "400",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },

  // Motion - Subtle, constraint-based
  motion: {
    fast: "80ms",
    standard: "100ms",
    slow: "120ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Borders
  border: {
    width: "1px",
    radius: "0px", // Sharp corners per Kanso (simplicity)
  },

  // Interactive Elements
  interactive: {
    cursor: "cursor-crosshair",
    focusRing: "2px solid rgba(255, 255, 255, 0.3)",
    activeBg: "rgba(255, 255, 255, 0.08)",
  },

  // Shadows - Subtle, minimalist
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.5)",
    md: "0 4px 6px rgba(0, 0, 0, 0.7)",
  },

  // Layout Breakpoints
  breakpoint: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
} as const;

export type VoidTokens = typeof voidTokens;
