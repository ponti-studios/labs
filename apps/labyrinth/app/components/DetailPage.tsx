import type { ReactNode } from "react";
import { Link } from "react-router";

type DetailHeaderProps = {
  back: ReactNode;
  media?: ReactNode;
  metadata?: ReactNode;
  summary: ReactNode;
  title: ReactNode;
};

export function DetailHeader({ back, media, metadata, summary, title }: DetailHeaderProps) {
  return (
    <section className="section detail-hero">
      <div className="flex min-h-11 items-start justify-between gap-4">
        {back}
        {media ? <div className="shrink-0">{media}</div> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <h1 className="display-1 text-primary max-w-4xl">{title}</h1>
        {metadata ? <div className="body-2 text-secondary max-w-2xl">{metadata}</div> : null}
        <p className="body-1 text-primary max-w-2xl">{summary}</p>
      </div>
    </section>
  );
}

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
            className="group focus-visible:outline-ring flex min-h-11 flex-col justify-center gap-1 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="body-4 text-secondary group-hover:text-accent transition-colors motion-reduce:transition-none">
              ← {previous.label}
            </span>
            <span className="heading-3 text-primary group-hover:text-accent transition-colors motion-reduce:transition-none">
              {previous.title}
            </span>
          </Link>
        ) : null}
        {next ? (
          <Link
            to={next.to}
            prefetch="intent"
            aria-label={`${next.label}: ${next.title}`}
            className="group focus-visible:outline-ring flex min-h-11 flex-col justify-center gap-1 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-auto sm:text-right"
          >
            <span className="body-4 text-secondary group-hover:text-accent transition-colors motion-reduce:transition-none">
              {next.label} →
            </span>
            <span className="heading-3 text-primary group-hover:text-accent transition-colors motion-reduce:transition-none">
              {next.title}
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
