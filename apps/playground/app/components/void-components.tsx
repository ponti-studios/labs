/**
 * VOID Design System Components
 * Reusable React components that embody the design system
 */

import React, { ReactNode } from "react";
import {
  cn,
  textStyles,
  layoutStyles,
  componentStyles,
  stateStyles,
  buttonClass,
  inputClass,
  cardClass,
} from "./void-styles";

/**
 * PageHeader - Consistent heading + description for all pages
 */
export const PageHeader: React.FC<{
  title: string;
  description?: string;
}> = ({ title, description }) => (
  <div className="mb-12 md:mb-16">
    <h1 className={textStyles.heading}>{title}</h1>
    {description && <p className={cn(textStyles.body, "mt-4 text-white/70")}>{description}</p>}
  </div>
);

/**
 * PageSection - Container with Ma spacing and border
 */
export const PageSection: React.FC<{
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}> = ({ title, subtitle, children, className }) => (
  <section className={cn(layoutStyles.section, className)}>
    {title && (
      <div className="mb-8 md:mb-12">
        <h2 className={textStyles.subheading}>{title}</h2>
        {subtitle && <p className={cn(textStyles.muted, "mt-2")}>{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

/**
 * InfoBox - Display information with subtle styling
 */
export const InfoBox: React.FC<{
  children: ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className }) => (
  <div className={cn(componentStyles.infoBox, className)}>
    {title && <p className={textStyles.label}>{title}</p>}
    <div className={textStyles.body}>{children}</div>
  </div>
);

/**
 * ResultBox - Display results with state-based styling
 */
export const ResultBox: React.FC<{
  children: ReactNode;
  state?: "pending" | "success" | "error" | "loading";
  label?: string;
  className?: string;
}> = ({ children, state = "success", label, className }) => (
  <div className={cn(componentStyles.resultBox, stateStyles[state], className)}>
    {label && <p className={textStyles.label}>{label}</p>}
    <div className="space-y-2">{children}</div>
  </div>
);

/**
 * InputField - Standardized input with label
 */
export const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  className?: string;
}> = ({ label, value, onChange, type = "text", placeholder, className }) => (
  <div className="space-y-2">
    <label className={textStyles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass(className)}
    />
  </div>
);

/**
 * RangeField - Standardized range input with label and value display
 */
export const RangeField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  className?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, showValue = true, className }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className={textStyles.label}>{label}</label>
      {showValue && <span className={cn(textStyles.label, "text-white/80")}>{value}</span>}
    </div>
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className={cn(componentStyles.range, className)}
    />
  </div>
);

/**
 * Button - Standardized button with variant support
 */
export const Button: React.FC<{
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "destructive";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}> = ({ children, onClick, variant = "primary", disabled = false, className, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={cn(buttonClass(variant), disabled && "opacity-50 cursor-not-allowed", className)}
  >
    {children}
  </button>
);

/**
 * FeatureCard - Navigation card with description
 */
export const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}> = ({ title, description, icon, href, onClick, active }) => {
  const content = (
    <div className={cardClass(active)}>
      {icon && <div className={cn(textStyles.label, "mb-3")}>{icon}</div>}
      <h3 className={cn(textStyles.subheading, "cursor-crosshair")}>{title}</h3>
      <p className={cn(textStyles.body, "text-white/60 mt-3")}>{description}</p>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return <div onClick={onClick}>{content}</div>;
};

/**
 * CodeBlock - Display code with monospace styling
 */
export const CodeBlock: React.FC<{
  children: string;
  language?: string;
  className?: string;
}> = ({ children, language, className }) => (
  <pre
    className={cn(
      "bg-white/2 border border-white/10 p-4 overflow-x-auto",
      "text-xs md:text-sm font-mono whitespace-pre-wrap break-words",
      className,
    )}
  >
    <code>{children}</code>
  </pre>
);

/**
 * DiffDisplay - Show before/after comparison
 */
export const DiffDisplay: React.FC<{
  before: string | ReactNode;
  after: string | ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}> = ({ before, after, beforeLabel = "BEFORE", afterLabel = "AFTER" }) => (
  <div className={cn(layoutStyles.grid, "gap-4 md:gap-6")}>
    <div className="space-y-2">
      <p className={textStyles.label}>{beforeLabel}</p>
      <div className="bg-white/2 border border-white/10 p-4 text-xs md:text-sm font-mono whitespace-pre-wrap break-words">
        {before}
      </div>
    </div>
    <div className="space-y-2">
      <p className={textStyles.label}>{afterLabel}</p>
      <div className="bg-white/5 border border-white/20 p-4 text-xs md:text-sm font-mono whitespace-pre-wrap break-words">
        {after}
      </div>
    </div>
  </div>
);

/**
 * FormSection - Container for form inputs
 */
export const FormSection: React.FC<{
  children: ReactNode;
  onSubmit: () => void;
  submitText?: string;
  className?: string;
  isLoading?: boolean;
}> = ({ children, onSubmit, submitText = "EXECUTE", className, isLoading = false }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
    className={cn(layoutStyles.stack, className)}
  >
    {children}
    <Button type="submit" disabled={isLoading}>
      {isLoading ? "EXECUTING..." : submitText}
    </Button>
  </form>
);

/**
 * GridSection - Two-column grid layout
 */
export const GridSection: React.FC<{
  children: ReactNode;
  cols?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
}> = ({ children, cols = 2, gap = "md" }) => {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
  }[cols];

  const gapClass = {
    sm: "gap-4",
    md: "gap-6 md:gap-8",
    lg: "gap-8 md:gap-12",
  }[gap];

  return <div className={cn("grid", gridClass, gapClass)}>{children}</div>;
};

/**
 * Callout - Highlighted information block
 */
export const Callout: React.FC<{
  children: ReactNode;
  type?: "info" | "warning" | "success";
  className?: string;
}> = ({ children, type = "info", className }) => {
  const styles = {
    info: "border-white/20 bg-white/3",
    warning: "border-white/30 bg-white/4",
    success: "border-white/25 bg-white/3",
  };

  return (
    <div className={cn("border-l-4 px-4 py-3 font-mono text-sm", styles[type], className)}>
      {children}
    </div>
  );
};

/**
 * Divider - Visual separation
 */
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("border-t border-white/10 my-8 md:my-12", className)} />
);

/**
 * Badge - Small label/badge component
 */
export const Badge: React.FC<{
  children: ReactNode;
  variant?: "neutral" | "success" | "warning";
  className?: string;
}> = ({ children, variant = "neutral", className }) => {
  const styles = {
    neutral: "bg-white/5 border border-white/20 text-white",
    success: "bg-white/8 border border-white/30 text-white",
    warning: "bg-white/6 border border-white/25 text-white",
  };

  return (
    <span
      className={cn(
        "inline-block px-3 py-1 text-xs font-mono uppercase tracking-widest",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

/**
 * Stack - Vertical stack with consistent spacing
 */
export const Stack: React.FC<{
  children: ReactNode;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}> = ({ children, spacing = "md", className }) => {
  const spacingClass = {
    sm: "space-y-3",
    md: "space-y-6",
    lg: "space-y-8 md:space-y-12",
  }[spacing];

  return <div className={cn(spacingClass, className)}>{children}</div>;
};
