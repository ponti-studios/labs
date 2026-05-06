import Link from "next/link";

export default function Custom500() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          500
        </p>
        <h1 className="mt-4 text-4xl font-normal uppercase tracking-[-0.04em] md:text-5xl">
          Server error
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Something went wrong while rendering the app.
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
