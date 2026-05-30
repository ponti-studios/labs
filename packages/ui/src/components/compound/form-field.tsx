import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}

export function RangeField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  className?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-widest text-white/80">{label}</label>
        {showValue && (
          <span className="text-xs font-mono uppercase tracking-widest text-white/80">{value}</span>
        )}
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0]!)}
        min={min}
        max={max}
        step={step}
        className={className}
      />
    </div>
  );
}

export function FormSection({
  children,
  onSubmit,
  submitText = "EXECUTE",
  className,
  isLoading = false,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
  submitText?: string;
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={cn("space-y-6", className)}
    >
      {children}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "EXECUTING..." : submitText}
      </Button>
    </form>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  onClick,
  active,
}: {
  title: string;
  description: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const content = (
    <Card
      className={cn(
        "hover:bg-white/5 cursor-crosshair transition-all duration-100",
        active && "border-white/20 bg-white/8",
      )}
    >
      <CardHeader>
        {icon && (
          <div className="mb-1 text-xs font-mono uppercase tracking-widest text-white/80">
            {icon}
          </div>
        )}
        <CardTitle className="text-lg md:text-xl font-mono uppercase tracking-wider">
          {title}
        </CardTitle>
        <CardDescription className="text-white/60 mt-2">{description}</CardDescription>
      </CardHeader>
    </Card>
  );

  if (href) return <a href={href}>{content}</a>;
  return <div onClick={onClick}>{content}</div>;
}
