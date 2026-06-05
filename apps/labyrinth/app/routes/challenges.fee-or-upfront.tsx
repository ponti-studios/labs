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
} from "@pontistudios/ui";

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

const RUN_DELAY_MS = 400;

export default function FeeOrUpfront(): JSX.Element {
  const [basePayment, setBasePayment] = useState("2");
  const [percentage, setPercentage] = useState("10");
  const [upfront, setUpfront] = useState("100");
  const [paymentsRaw, setPaymentsRaw] = useState("100, 200, 300, 400");
  const [feeResult, setFeeResult] = useState<FeeResult | null>(null);
  const [feeRunning, setFeeRunning] = useState(false);

  const run = () => {
    setFeeRunning(true);
    setFeeResult(null);
    setTimeout(() => {
      const payments = parsePayments(paymentsRaw);
      setFeeResult(calcFeeOrUpfront(Number(basePayment), Number(percentage), Number(upfront), payments));
      setFeeRunning(false);
    }, RUN_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Fee or Upfront</h2>
        <p className="text-muted-foreground">
          Given a series of payments, determine whether paying an upfront fee is cheaper than
          paying a percentage-based fee on each transaction. For each payment, the fee charged
          is{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            max(basePayment, payment × x%)
          </code>
          . Compare the sum of those fees against the flat upfront cost.
        </p>
        <i className="text-xs text-muted-foreground">Courtesy of Goldman Sachs</i>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
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

          <Button onClick={run} disabled={feeRunning} className="self-start min-w-24">
            {feeRunning ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Running…
              </span>
            ) : (
              "Calculate"
            )}
          </Button>
        </CardContent>
      </Card>

      {feeResult && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Total fee cost
                </p>
                <p className="text-2xl font-semibold font-mono">${feeResult.feeTotal.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Upfront cost
                </p>
                <p className="text-2xl font-semibold font-mono">${feeResult.upfront.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card
              className={
                feeResult.choice === "upfront"
                  ? "border-green-400 bg-green-50"
                  : "border-blue-400 bg-blue-50"
              }
            >
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Recommendation
                </p>
                <Badge
                  variant="outline"
                  className={
                    feeResult.choice === "upfront"
                      ? "border-green-500 text-green-700 text-sm px-3 py-1"
                      : "border-blue-500 text-blue-700 text-sm px-3 py-1"
                  }
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

          <Card>
            <CardHeader>
              <CardTitle>Payment breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                For each payment:{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  charge = max(k, payment × x%)
                </code>
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
                        style={{
                          animation: "fade-slide-in 300ms ease-out both",
                          animationDelay: `${i * 80}ms`,
                        }}
                      >
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-mono">${row.payment}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          ${row.percentageAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          ${basePayment}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          ${row.chargedAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              usedPercentage
                                ? "border-violet-300 text-violet-700"
                                : "border-orange-300 text-orange-700"
                            }
                          >
                            {usedPercentage ? `${percentage}% rate` : "base fee"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="font-semibold bg-muted/40">
                    <TableCell colSpan={4} className="text-right text-muted-foreground">
                      Total fees
                    </TableCell>
                    <TableCell className="font-mono">${feeResult.feeTotal.toFixed(2)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
