import { Link } from "react-router";

type DetailNavigationItem = {
  label: string;
  title: string;
  to: string;
};

type DetailNavigationProps = {
  ariaLabel: string;
  next?: DetailNavigationItem | null;
  previous?: DetailNavigationItem | null;
};

export function DetailNavigation({ ariaLabel, next, previous }: DetailNavigationProps) {
  if (!previous && !next) return null;

  return (
    <nav aria-label={ariaLabel} className="section section-compact">
      <div className="detail-navigation">
        {previous ? (
          <Link
            to={previous.to}
            prefetch="intent"
            aria-label={`${previous.label}: ${previous.title}`}
            className="press detail-navigation-link group"
          >
            <span className="text-muted-foreground group-hover:text-accent text-xs transition-colors motion-reduce:transition-none">
              <span className="inline-block transition-transform duration-150 ease-out group-hover:-translate-x-1 motion-reduce:transition-none">
                ←
              </span>{" "}
              {previous.label}
            </span>
            <span className="text-foreground group-hover:text-accent text-lg font-semibold tracking-tight transition-colors motion-reduce:transition-none">
              {previous.title}
            </span>
          </Link>
        ) : null}
        {next ? (
          <Link
            to={next.to}
            prefetch="intent"
            aria-label={`${next.label}: ${next.title}`}
            className="press detail-navigation-link group sm:ml-auto sm:text-right"
          >
            <span className="text-muted-foreground group-hover:text-accent text-xs transition-colors motion-reduce:transition-none">
              {next.label}{" "}
              <span className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none">
                →
              </span>
            </span>
            <span className="text-foreground group-hover:text-accent text-lg font-semibold tracking-tight transition-colors motion-reduce:transition-none">
              {next.title}
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
