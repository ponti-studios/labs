/**
 * VOID Design System Utilities
 * CSS class generators and helper functions adhering to design constraints
 */

/**
 * Generate base styles for all pages
 */
export const pageStyles = {
  container: "min-h-screen bg-black text-white font-mono",
  wrapper: "w-full max-w-6xl mx-auto px-4 py-8 md:py-12",
};

/**
 * Typography utilities
 */
export const textStyles = {
  heading: "text-2xl md:text-3xl font-mono uppercase tracking-wider font-bold",
  subheading: "text-lg md:text-xl font-mono uppercase tracking-wider mt-2",
  body: "text-sm md:text-base font-mono tracking-wide leading-relaxed",
  muted: "text-white/60 font-mono uppercase text-xs tracking-widest",
  label: "text-xs font-mono uppercase tracking-widest text-white/80",
  code: "font-mono text-sm bg-white/5 border border-white/10 px-2 py-1",
};

/**
 * Layout utilities
 */
export const layoutStyles = {
  section: "border-t border-white/10 pt-12 md:pt-16 first:border-t-0",
  sectionMajor: "my-64 py-12 md:py-24", // Ma spacing between major sections
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
  stack: "space-y-6",
  flex: "flex items-center gap-4",
};

/**
 * Component utilities
 */
export const componentStyles = {
  // Card for navigation/feature display
  card: "border border-white/10 bg-white/0 hover:bg-white/5 p-6 transition-all duration-100 cursor-crosshair",
  cardActive: "border border-white/20 bg-white/8",

  // Input field styling
  input:
    "w-full bg-black border border-white/20 text-white font-mono text-sm p-3 " +
    "focus:outline-none focus:border-white/40 focus:bg-white/5 transition-colors duration-100 " +
    "placeholder-white/40 uppercase",

  // Button styling
  button:
    "px-6 py-2 border border-white/20 text-white font-mono text-xs uppercase tracking-widest " +
    "hover:bg-white/10 hover:border-white/40 active:bg-white/20 " +
    "transition-all duration-100 cursor-crosshair",

  buttonDestructive:
    "px-6 py-2 border border-white/40 bg-white/5 text-white font-mono text-xs uppercase tracking-widest " +
    "hover:bg-white/15 hover:border-white/60 active:bg-white/25 " +
    "transition-all duration-100 cursor-crosshair",

  // Result/info box
  resultBox: "border border-white/10 bg-white/2 p-6 font-mono text-sm " + "space-y-3",

  resultBoxSuccess: "border border-white/20 bg-white/5 p-6 font-mono text-sm " + "space-y-3",

  // Information boxes
  infoBox: "border-l-2 border-white/30 bg-white/2 px-4 py-3 font-mono text-xs " + "space-y-2",

  // Range input (slider)
  range: "w-full accent-white cursor-crosshair",

  // Select dropdown
  select:
    "w-full bg-black border border-white/20 text-white font-mono text-sm p-3 " +
    "focus:outline-none focus:border-white/40 focus:bg-white/5 transition-colors duration-100 " +
    "uppercase cursor-crosshair",
};

/**
 * State utilities for showing execution status
 */
export const stateStyles = {
  pending: "border-white/10 bg-white/2",
  success: "border-white/20 bg-white/5",
  error: "border-white/30 bg-white/3",
  loading: "animate-pulse border-white/15 bg-white/3",
};

/**
 * Utility to build combined class strings
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Build button class string with variant support
 */
export function buttonClass(variant: "primary" | "destructive" = "primary"): string {
  return variant === "destructive" ? componentStyles.buttonDestructive : componentStyles.button;
}

/**
 * Build input class string
 */
export function inputClass(...additional: string[]): string {
  return cn(componentStyles.input, ...additional);
}

/**
 * Build card class string
 */
export function cardClass(active: boolean = false): string {
  return cn(componentStyles.card, active && componentStyles.cardActive);
}

/**
 * Spacing utilities - Ma principle
 */
export const spacing = {
  getMarginTop: (level: "section" | "major" = "section"): string => {
    return level === "major" ? "mt-64" : "mt-12 md:mt-16";
  },
  getSectionPadding: (): string => "pt-12 md:pt-16 pb-8 md:pb-12",
};

/**
 * Format values for display with monospace alignment
 */
export function formatOutput(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  return String(value).toUpperCase();
}

/**
 * Create a visual separator line
 */
export const separator = "border-t border-white/10";
