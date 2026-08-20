import { cloneElement, isValidElement } from "react";
import type { ComponentChildren, VNode } from "preact";

type SlotProps = Record<string, unknown> & {
  className?: unknown;
  children?: ComponentChildren;
};

/** Merges `props` onto its single child instead of rendering a wrapper element. */
export function Slot({ children, className, ...props }: SlotProps) {
  if (!isValidElement(children)) return (children ?? null) as never;
  const child = children as VNode<{ className?: string }>;
  return cloneElement(child as never, {
    ...props,
    ...child.props,
    className:
      [className, child.props.className].filter(Boolean).map(String).join(" ") || undefined,
  } as never);
}
