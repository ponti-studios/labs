import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 text-4xl font-normal uppercase tracking-[-0.04em] md:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          The route you requested does not exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-none border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
