import { useState, type JSX, type ChangeEvent } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@pontistudios/ui";

// ─── Fee or Upfront ──────────────────────────────────────────────────────────

type FeeChoice = "upfront" | "fee";

interface PaymentBreakdown {
  payment: number;
  percentageAmount: number;
  chargedAmount: number;
}

interface FeeResult {
  feeTotal: number;
  upfront: number;
  choice: FeeChoice;
  breakdown: PaymentBreakdown[];
}

function calcFeeOrUpfront(
  basePayment: number,
  percentage: number,
  upfront: number,
  payments: number[],
): FeeResult {
  const breakdown: PaymentBreakdown[] = payments.map((payment) => {
    const percentageAmount = payment * (percentage / 100);
    const chargedAmount = percentageAmount >= basePayment ? percentageAmount : basePayment;
    return { payment, percentageAmount, chargedAmount };
  });

  const feeTotal = breakdown.reduce((sum, row) => sum + row.chargedAmount, 0);
  return {
    feeTotal,
    upfront,
    choice: upfront < feeTotal ? "upfront" : "fee",
    breakdown,
  };
}

function parsePayments(raw: string): number[] {
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0);
}

// ─── Prime Countdown ─────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

const RUN_DELAY_MS = 400;

export default function GoldmanSachs(): JSX.Element {
  // Fee or Upfront state
  const [basePayment, setBasePayment] = useState("2");
  const [percentage, setPercentage] = useState("10");
  const [upfront, setUpfront] = useState("100");
  const [paymentsRaw, setPaymentsRaw] = useState("100, 200, 300, 400");
  const [feeResult, setFeeResult] = useState<FeeResult | null>(null);
  const [feeRunning, setFeeRunning] = useState(false);

  // Prime countdown state
  const [primeStart, setPrimeStart] = useState("20");
  const [primeEntries, setPrimeEntries] = useState<PrimeEntry[] | null>(null);
  const [primeRunning, setPrimeRunning] = useState(false);

  const runFee = () => {
    setFeeRunning(true);
    setFeeResult(null);
    setTimeout(() => {
      const payments = parsePayments(paymentsRaw);
      setFeeResult(calcFeeOrUpfront(Number(basePayment), Number(percentage), Number(upfront), payments));
      setFeeRunning(false);
    }, RUN_DELAY_MS);
  };

  const runPrimes = () => {
    setPrimeRunning(true);
    setPrimeEntries(null);
    setTimeout(() => {
      setPrimeEntries(getPrimeCountdown(Number(primeStart)));
      setPrimeRunning(false);
    }, RUN_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Goldman Sachs</h2>
        <p className="text-muted-foreground">
          Two algorithm problems from a Goldman Sachs take-home interview.
        </p>
      </header>

      <Tabs defaultValue="fee">
        <TabsList>
          <TabsTrigger value="fee">Fee or Upfront</TabsTrigger>
          <TabsTrigger value="prime">Prime Countdown</TabsTrigger>
        </TabsList>

        {/* ── Fee or Upfront ─────────────────────────────────────── */}
        <TabsContent value="fee" className="flex flex-col gap-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee or Upfront</CardTitle>
              <p className="text-sm text-muted-foreground">
                Given a series of payments, determine whether paying an upfront fee is cheaper
                than paying a percentage-based fee on each transaction. For each payment, the
                fee charged is <code className="text-xs bg-muted px-1 py-0.5 rounded">max(basePayment, payment × x%)</code>.
                Compare the sum of those fees against the flat upfront cost.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="basePayment">Base fee (k)</Label>
                  <Input
                    id="basePayment"
                    type="number"
                    min={0}
                    value={basePayment}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBasePayment(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Minimum fee per payment</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="percentage">Rate (x%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min={0}
                    max={100}
                    value={percentage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPercentage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Percentage of each payment</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="upfront">Upfront fee (d)</Label>
                  <Input
                    id="upfront"
                    type="number"
                    min={0}
                    value={upfront}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUpfront(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">One-time flat cost</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="payments">Payments (p)</Label>
                  <Input
                    id="payments"
                    value={paymentsRaw}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentsRaw(e.target.value)}
                    placeholder="e.g. 100, 200, 300"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated amounts</p>
                </div>
              </div>

              <Button onClick={runFee} disabled={feeRunning} className="self-start min-w-24">
                {feeRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Running…
                  </span>
                ) : "Calculate"}
              </Button>
            </CardContent>
          </Card>

          {feeResult && (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total fee cost</p>
                    <p className="text-2xl font-semibold font-mono">${feeResult.feeTotal.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Upfront cost</p>
                    <p className="text-2xl font-semibold font-mono">${feeResult.upfront.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className={feeResult.choice === "upfront" ? "border-green-400 bg-green-50" : "border-blue-400 bg-blue-50"}>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recommendation</p>
                    <Badge
                      variant="outline"
                      className={feeResult.choice === "upfront"
                        ? "border-green-500 text-green-700 text-sm px-3 py-1"
                        : "border-blue-500 text-blue-700 text-sm px-3 py-1"}
                    >
                      {feeResult.choice === "upfront" ? "Pay upfront" : "Pay per-fee"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      {feeResult.choice === "upfront"
                        ? `Saves $${(feeResult.feeTotal - feeResult.upfront).toFixed(2)} vs fee`
                        : `Saves $${(feeResult.upfront - feeResult.feeTotal).toFixed(2)} vs upfront`}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown table */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment breakdown</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    For each payment: <code className="text-xs bg-muted px-1 py-0.5 rounded">charge = max(k, payment × x%)</code>
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>{percentage}% of payment</TableHead>
                        <TableHead>Base fee (k)</TableHead>
                        <TableHead>Charged</TableHead>
                        <TableHead>Rule applied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeResult.breakdown.map((row, i) => {
                        const usedPercentage = row.percentageAmount >= Number(basePayment);
                        return (
                          <TableRow
                            key={i}
                            style={{ animation: "fade-slide-in 300ms ease-out both", animationDelay: `${i * 80}ms` }}
                          >
                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-mono">${row.payment}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">${row.percentageAmount.toFixed(2)}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">${basePayment}</TableCell>
                            <TableCell className="font-mono font-medium">${row.chargedAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={usedPercentage ? "border-violet-300 text-violet-700" : "border-orange-300 text-orange-700"}>
                                {usedPercentage ? `${percentage}% rate` : "base fee"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-semibold bg-muted/40">
                        <TableCell colSpan={4} className="text-right text-muted-foreground">Total fees</TableCell>
                        <TableCell className="font-mono">${feeResult.feeTotal.toFixed(2)}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── Prime Countdown ────────────────────────────────────── */}
        <TabsContent value="prime" className="flex flex-col gap-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Prime Number Countdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Using a JavaScript generator, yield prime numbers in descending order from{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">n−1</code> down to{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">2</code>. A number is
                prime if it has no divisors other than 1 and itself — checked by trial division
                up to <code className="text-xs bg-muted px-1 py-0.5 rounded">√n</code>.
              </p>
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
                <Button onClick={runPrimes} disabled={primeRunning} className="min-w-24">
                  {primeRunning ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Running…
                    </span>
                  ) : "Generate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {primeEntries && (
            <div className="flex flex-col gap-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Numbers checked</p>
                    <p className="text-2xl font-semibold font-mono">{primeEntries.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Primes found</p>
                    <p className="text-2xl font-semibold font-mono text-green-600">
                      {primeEntries.filter((e) => e.isPrime).length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Composite</p>
                    <p className="text-2xl font-semibold font-mono text-muted-foreground">
                      {primeEntries.filter((e) => !e.isPrime).length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Grid */}
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
                        style={{ animation: "fade-slide-in 250ms ease-out both", animationDelay: `${i * 30}ms` }}
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

              {/* Generator output */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
