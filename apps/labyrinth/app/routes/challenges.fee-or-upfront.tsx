import { useMemo, useState, type JSX, type ChangeEvent } from 'react';
import {
  Badge,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@pontistudios/ui';

type Choice = 'upfront' | 'per-transaction';

interface TransactionRow {
  payment: number;
  rateAmount: number;
  charged: number;
  rule: 'rate' | 'base';
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
    return { payment, rateAmount, charged, rule: rateAmount >= basePayment ? 'rate' : 'base' };
  });
  const totalFees = rows.reduce((sum, r) => sum + r.charged, 0);
  const choice = upfront < totalFees ? 'upfront' : 'per-transaction';
  return { rows, totalFees, upfront, choice, savings: Math.abs(totalFees - upfront) };
}

function parsePayments(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0);
}

export default function FeeOrUpfront(): JSX.Element {
  const [basePayment, setBasePayment] = useState('2');
  const [rate, setRate] = useState('10');
  const [upfront, setUpfront] = useState('100');
  const [paymentsRaw, setPaymentsRaw] = useState('100, 200, 300, 400');

  const result = useMemo(
    () => calculate(Number(basePayment), Number(rate), Number(upfront), parsePayments(paymentsRaw)),
    [basePayment, rate, upfront, paymentsRaw],
  );

  const winnerIsUpfront = result.choice === 'upfront';

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Fee or Upfront</h2>
        <p className="text-sm text-muted-foreground">
          Two pricing models: pay once upfront, or{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">max(base, amount × rate%)</code>
          {' '}per transaction.
        </p>
        <i className="text-xs text-muted-foreground">Courtesy of Goldman Sachs</i>
      </header>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-px bg-border rounded-xl overflow-hidden shadow-sm">
        {/* Option A — Upfront */}
        <div className={`flex flex-col gap-4 p-5 bg-background ${winnerIsUpfront ? 'bg-green-50/60' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Option A</p>
              <h3 className="text-base font-semibold">Upfront</h3>
            </div>
            {winnerIsUpfront && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">✓ cheaper</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="upfront" className="text-xs">Flat fee ($)</Label>
            <Input id="upfront" type="number" min={0} value={upfront}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUpfront(e.target.value)} />
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Total</p>
            <p className={`font-mono text-2xl font-bold tabular-nums ${winnerIsUpfront ? 'text-green-700' : ''}`}>
              ${result.upfront.toFixed(2)}
            </p>
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center bg-background px-3">
          <span className="text-xs font-semibold text-muted-foreground">vs</span>
        </div>

        {/* Option B — Per-transaction */}
        <div className={`flex flex-col gap-4 p-5 bg-background ${!winnerIsUpfront ? 'bg-green-50/60' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Option B</p>
              <h3 className="text-base font-semibold">Per-transaction</h3>
            </div>
            {!winnerIsUpfront && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">✓ cheaper</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="basePayment" className="text-xs">Base fee ($)</Label>
              <Input id="basePayment" type="number" min={0} value={basePayment}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBasePayment(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate" className="text-xs">Rate (%)</Label>
              <Input id="rate" type="number" min={0} max={100} value={rate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payments" className="text-xs">Amounts ($, comma-separated)</Label>
            <Input id="payments" value={paymentsRaw} placeholder="e.g. 100, 200, 300"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentsRaw(e.target.value)} />
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Total</p>
            <p className={`font-mono text-2xl font-bold tabular-nums ${!winnerIsUpfront ? 'text-green-700' : ''}`}>
              ${result.totalFees.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {winnerIsUpfront ? 'Upfront' : 'Per-transaction'} saves{' '}
        <span className="font-semibold text-foreground font-mono">${result.savings.toFixed(2)}</span>
      </p>

      {/* Breakdown table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>{rate}% of amount</TableHead>
            <TableHead>Base fee</TableHead>
            <TableHead>Charged</TableHead>
            <TableHead>Rule</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-mono">${row.payment}</TableCell>
              <TableCell className="font-mono text-muted-foreground">${row.rateAmount.toFixed(2)}</TableCell>
              <TableCell className="font-mono text-muted-foreground">${basePayment}</TableCell>
              <TableCell className="font-mono font-medium">${row.charged.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={row.rule === 'rate' ? 'border-violet-300 text-violet-700' : 'border-orange-300 text-orange-700'}>
                  {row.rule === 'rate' ? `${rate}% rate` : 'base fee'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/40 font-semibold">
            <TableCell colSpan={4} className="text-right text-muted-foreground">Total per-transaction</TableCell>
            <TableCell className="font-mono">${result.totalFees.toFixed(2)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
