"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <div className="max-w-md text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Application error
            </p>
            <h1 className="mt-4 text-4xl font-normal uppercase tracking-[-0.04em] md:text-5xl">
              Something went wrong
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{error.message}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex rounded-none border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
