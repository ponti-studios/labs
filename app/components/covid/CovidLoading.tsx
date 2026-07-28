export default function CovidLoading() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-3xl">
        <span className="inline-block animate-bounce [animation-delay:0ms]" aria-hidden="true">
          🦠
        </span>
        <span className="inline-block animate-bounce [animation-delay:150ms]" aria-hidden="true">
          🔬
        </span>
        <span className="inline-block animate-bounce [animation-delay:300ms]" aria-hidden="true">
          🦠
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Crunching the numbers</span>
        <span className="inline-block animate-pulse [animation-delay:0ms]" aria-hidden="true">
          .
        </span>
        <span className="inline-block animate-pulse [animation-delay:200ms]" aria-hidden="true">
          .
        </span>
        <span className="inline-block animate-pulse [animation-delay:400ms]" aria-hidden="true">
          .
        </span>
      </div>
    </div>
  );
}
