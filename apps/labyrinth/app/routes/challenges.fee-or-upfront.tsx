import { Input } from "@pontistudios/ui/forms";
import { Label } from "@pontistudios/ui/primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pontistudios/ui/data-display";
import { useMemo, useState, type JSX, type ChangeEvent } from "react";
import { Badge } from "@pontistudios/ui/primitives";

type Choice = "upfront" | "per-transaction";

interface TransactionRow {
  payment: number;
  charged: number;
  rule: "rate" | "base";
}

interface Result {
  rows: TransactionRow[];
  totalFees: number;
  upfront: number;
  choice: Choice;
  savings: number;
}

function calculate(basePayment: number, rate: number, upfront: number, payments: number[]): Result {
  const rows: TransactionRow[] = payments.map((payment) => {
    const rateAmount = payment * (rate / 100);
    const charged = rateAmount >= basePayment ? rateAmount : basePayment;
    return { payment, charged, rule: rateAmount >= basePayment ? "rate" : "base" };
  });
  const totalFees = rows.reduce((sum, r) => sum + r.charged, 0);
  const choice = upfront < totalFees ? "upfront" : "per-transaction";
  return { rows, totalFees, upfront, choice, savings: Math.abs(totalFees - upfront) };
}

function parsePayments(raw: string): number[] {
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0);
}

export default function FeeOrUpfront(): JSX.Element {
  const [basePayment, setBasePayment] = useState("2");
  const [rate, setRate] = useState("10");
  const [upfront, setUpfront] = useState("100");
  const [paymentsRaw, setPaymentsRaw] = useState("100, 200, 300, 400");

  const result = useMemo(
    () => calculate(Number(basePayment), Number(rate), Number(upfront), parsePayments(paymentsRaw)),
    [basePayment, rate, upfront, paymentsRaw],
  );

  const winnerIsUpfront = result.choice === "upfront";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Fee or Upfront</h2>
        <p className="text-secondary text-sm">
          Two pricing models: pay once upfront, or{" "}
          <code className="bg-inset rounded px-1 py-0.5 text-xs">max(base, amount × rate%)</code>{" "}
          per transaction.
        </p>
        <i className="text-secondary text-xs">Courtesy of Goldman Sachs</i>
      </header>

      {/* Side-by-side comparison */}
      <div className="bg-border grid grid-cols-[1fr_auto_1fr] gap-px overflow-hidden rounded-xl shadow-sm">
        {/* Option A — Upfront */}
        <div
          className={`bg-canvas flex flex-col gap-4 p-5 ${winnerIsUpfront ? "bg-green-50/60" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-[10px] font-medium tracking-widest uppercase">
                Option A
              </p>
              <h3 className="text-base font-semibold">Upfront</h3>
            </div>
            {winnerIsUpfront && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                ✓ cheaper
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="upfront" className="text-xs">
              Flat fee ($)
            </Label>
            <Input
              id="upfront"
              type="number"
              min={0}
              value={upfront}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUpfront(e.target.value)}
            />
          </div>

          <div className="border-default border-t pt-3">
            <p className="text-secondary mb-0.5 text-[10px] tracking-wide uppercase">Total</p>
            <p
              className={`font-mono text-2xl font-bold tabular-nums ${winnerIsUpfront ? "text-green-700" : ""}`}
            >
              ${result.upfront.toFixed(2)}
            </p>
          </div>
        </div>

        {/* VS */}
        <div className="bg-canvas flex items-center justify-center px-3">
          <span className="text-secondary text-xs font-semibold">vs</span>
        </div>

        {/* Option B — Per-transaction */}
        <div
          className={`bg-canvas flex flex-col gap-4 p-5 ${!winnerIsUpfront ? "bg-green-50/60" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-[10px] font-medium tracking-widest uppercase">
                Option B
              </p>
              <h3 className="text-base font-semibold">Per-transaction</h3>
            </div>
            {!winnerIsUpfront && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                ✓ cheaper
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="basePayment" className="text-xs">
                Base fee ($)
              </Label>
              <Input
                id="basePayment"
                type="number"
                min={0}
                value={basePayment}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBasePayment(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate" className="text-xs">
                Rate (%)
              </Label>
              <Input
                id="rate"
                type="number"
                min={0}
                max={100}
                value={rate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payments" className="text-xs">
              Amounts ($, comma-separated)
            </Label>
            <Input
              id="payments"
              value={paymentsRaw}
              placeholder="e.g. 100, 200, 300"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentsRaw(e.target.value)}
            />
          </div>

          <div className="border-default border-t pt-3">
            <p className="text-secondary mb-0.5 text-[10px] tracking-wide uppercase">Total</p>
            <p
              className={`font-mono text-2xl font-bold tabular-nums ${!winnerIsUpfront ? "text-green-700" : ""}`}
            >
              ${result.totalFees.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-secondary text-center text-xs">
        {winnerIsUpfront ? "Upfront" : "Per-transaction"} saves{" "}
        <span className="text-primary font-mono font-semibold">${result.savings.toFixed(2)}</span>
      </p>

      {/* Breakdown table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Charged</TableHead>
            <TableHead>Rule</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="text-secondary">{i + 1}</TableCell>
              <TableCell className="font-mono">${row.payment}</TableCell>
              <TableCell className="font-mono font-medium">${row.charged.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    row.rule === "rate"
                      ? "border-violet-300 text-violet-700"
                      : "border-orange-300 text-orange-700"
                  }
                >
                  {row.rule === "rate" ? `${rate}% rate` : "base fee"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-inset/40 font-semibold">
            <TableCell colSpan={2} className="text-secondary text-right">
              Total
            </TableCell>
            <TableCell className="font-mono">${result.totalFees.toFixed(2)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
