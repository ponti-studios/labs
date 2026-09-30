import type { ComponentPropsWithoutRef } from "react";
import { BOOK_CALL_URL } from "~/data/studio";
import { cn } from "~/lib/utils";

type BookCallButtonProps = Omit<ComponentPropsWithoutRef<"a">, "href">;

/**
 * The single "Book a call" CTA used everywhere `BOOK_CALL_URL` is linked.
 * Styled as a retro mechanical keycap (see `.btn-keycap` in app.css) so the
 * press animation reads as the key bottoming out, not a generic tap.
 */
export function BookCallButton({ className, children, ...props }: BookCallButtonProps) {
  return (
    <a
      href={BOOK_CALL_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "btn-keycap bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-mono text-sm font-bold tracking-wide uppercase select-none",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
