import { useState, type JSX, type ChangeEvent } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@pontistudios/ui";

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
  for (let v = start - 1; v > 1; v--) {
    entries.push({ value: v, isPrime: isPrime(v) });
  }
  return entries;
}

const RUN_DELAY_MS = 400;

export default function PrimeCountdown(): JSX.Element {
  const [primeStart, setPrimeStart] = useState("20");
  const [primeEntries, setPrimeEntries] = useState<PrimeEntry[] | null>(() => getPrimeCountdown(20));
  const [running, setRunning] = useState(false);

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
          Using a JavaScript generator, yield prime numbers in descending order from{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">n−1</code> down to{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">2</code>. A number is prime if
          it has no divisors other than 1 and itself — checked by trial division up to{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">√n</code>.
        </p>
        <i className="text-xs text-muted-foreground">Courtesy of Goldman Sachs</i>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-1.5 w-40">
              <Label htmlFor="primeStart">Starting number (n)</Label>
              <Input
                id="primeStart"
                type="number"
                min={3}
                max={200}
                value={primeStart}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPrimeStart(e.target.value)}
              />
            </div>
            <Button onClick={run} disabled={running} className="min-w-24">
              {running ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Running…
                </span>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {primeEntries && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Numbers checked
                </p>
                <p className="text-2xl font-semibold font-mono">{primeEntries.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Primes found
                </p>
                <p className="text-2xl font-semibold font-mono text-green-600">
                  {primeEntries.filter((e) => e.isPrime).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Composite
                </p>
                <p className="text-2xl font-semibold font-mono text-muted-foreground">
                  {primeEntries.filter((e) => !e.isPrime).length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Green = prime (yielded by generator) · Grey = composite (skipped)
              </p>
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
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-mono font-medium border ${
                      entry.isPrime
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-muted/40 border-border text-muted-foreground"
                    }`}
                  >
                    {entry.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generator output</CardTitle>
              <p className="text-sm text-muted-foreground">Values yielded in order</p>
            </CardHeader>
            <CardContent>
              <code className="text-sm font-mono text-green-700 bg-green-50 block p-3 rounded-lg leading-7">
                [{primeEntries.filter((e) => e.isPrime).map((e) => e.value).join(", ")}]
              </code>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
