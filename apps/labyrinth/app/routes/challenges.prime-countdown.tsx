import { useState, useMemo, type JSX, type ChangeEvent } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@pontistudios/ui";

interface PrimeEntry {
  value: number;
  isPrime: boolean;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d <= Math.sqrt(n); d++) {
    if (n % d === 0) return false;
  }
  return true;
}

function getPrimeCountdown(start: number): PrimeEntry[] {
  const entries: PrimeEntry[] = [];
  for (let v = start; v >= 1; v--) {
    entries.push({ value: v, isPrime: isPrime(v) });
  }
  return entries;
}

const RUN_DELAY_MS = 400;

export default function PrimeCountdown(): JSX.Element {
  const [primeStart, setPrimeStart] = useState("20");
  const [primeEntries, setPrimeEntries] = useState<PrimeEntry[] | null>(() =>
    getPrimeCountdown(20),
  );
  const [running, setRunning] = useState(false);

  const { primesCount, compositeCount } = useMemo(() => {
    if (!primeEntries) return { primesCount: 0, compositeCount: 0 };
    let primes = 0;
    for (const e of primeEntries) {
      if (e.isPrime) primes++;
    }
    return { primesCount: primes, compositeCount: primeEntries.length - primes };
  }, [primeEntries]);

  const run = () => {
    setRunning(true);
    setPrimeEntries(null);
    setTimeout(() => {
      setPrimeEntries(getPrimeCountdown(Number(primeStart)));
      setRunning(false);
    }, RUN_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Prime Number Countdown</h2>
        <p className="text-muted-foreground">
          yields prime numbers in from <code className="bg-muted rounded px-1 py-0.5">n</code> down
          to <code className="bg-muted rounded px-1 py-0.5">1</code>. A number is prime if it has no
          divisors other than 1 and itself — checked by trial division up to{" "}
          <code className="bg-muted rounded px-1 py-0.5">√n</code>.
        </p>
        <i className="text-muted-foreground text-xs">Courtesy of Goldman Sachs</i>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Prime Countdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 align-middle md:grid-cols-3">
          <div className="flex items-end">
            <Input
              id="primeStart"
              type="number"
              min={3}
              value={primeStart}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPrimeStart(e.target.value)}
            />
            <Button onClick={run} disabled={running} className="min-w-24">
              {running ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Running…
                </span>
              ) : (
                "Generate"
              )}
            </Button>
          </div>

          {primeEntries && (
            <>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold text-green-600">{primesCount}</p>
                <p className="text-muted-foreground text-xs font-medium">Primes found</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold">{compositeCount}</p>
                <p className="text-muted-foreground text-xs font-medium">Composite</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {primeEntries && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {primeEntries.map((entry, i) => (
                  <span
                    key={entry.value}
                    style={{
                      animation: "fade-slide-in 250ms ease-out both",
                      animationDelay: `${i * 30}ms`,
                    }}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm font-medium ${
                      entry.isPrime
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "bg-muted/40 border text-muted-foreground"
                    }`}
                  >
                    {entry.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
