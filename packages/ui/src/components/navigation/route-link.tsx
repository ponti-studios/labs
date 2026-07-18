import type { ComponentPropsWithoutRef, ElementType, MouseEvent, ReactNode } from "react";
import { useCallback } from "react";

type RouteLinkOwnProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** Called before the click is forwarded — e.g. to flip a route-loading store. */
  onNavigate?: () => void;
};

export type RouteLinkProps<T extends ElementType = "a"> = RouteLinkOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RouteLinkOwnProps<T>>;

/**
 * Polymorphic link that fires `onNavigate` before `onClick`. Pass your
 * router's `Link` component as `as` for client-side navigation (e.g.
 * `as={Link} to="/accounts"`); the host app owns any route-loading state via
 * `onNavigate` instead of a hardcoded store.
 */
export function RouteLink<T extends ElementType = "a">({
  as,
  children,
  onNavigate,
  onClick,
  ...props
}: RouteLinkProps<T>) {
  const Component = (as ?? "a") as ElementType;

  const handleClick = useCallback(
    (e: MouseEvent) => {
      onNavigate?.();
      (onClick as ((e: MouseEvent) => void) | undefined)?.(e);
    },
    [onNavigate, onClick],
  );

  return (
    <Component onClick={handleClick} {...props}>
      {children}
    </Component>
  );
}
