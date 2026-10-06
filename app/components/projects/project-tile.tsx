import { Link } from "react-router";
import { cn } from "~/lib/utils";

export type ProjectTileProps = {
  href: string;
  name: string;
  description: string;
  /** Plain status text, e.g. "Active". */
  status: string;
  /** One mono line under the description: tech stack, or a playground category. */
  meta: string;
  logo?: string;
  className?: string;
  "data-testid"?: string;
};

/** Lab tile for products and playground experiments. Same family as CaseTile. */
export function ProjectTile({
  href,
  name,
  description,
  status,
  meta,
  logo,
  className,
  ...rest
}: ProjectTileProps) {
  return (
    <Link
      to={href}
      prefetch="intent"
      data-testid={rest["data-testid"]}
      className={cn(
        "group border-border bg-card hover:border-foreground focus-visible:ring-foreground flex h-full flex-col justify-between gap-12 rounded-sm border p-6 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {logo ? (
          <span className="border-border rounded-sm border bg-white p-1.5">
            <img src={logo} alt="" className="size-7 object-contain grayscale" />
          </span>
        ) : (
          <span />
        )}
        <span className="text-muted-foreground text-sm">{status}</span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-foreground text-3xl font-semibold tracking-tight">{name}</h3>
        <p className="text-muted-foreground line-clamp-3 max-w-[40ch] text-sm leading-snug">
          {description}
        </p>
      </div>

      <div className="border-border flex items-end justify-between gap-4 border-t pt-4">
        <p className="text-muted-foreground min-w-0 truncate font-mono text-xs">{meta}</p>
        <span
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-foreground font-mono text-xl leading-none transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}
