import { useMemo, useState, type JSX, type ChangeEvent } from 'react';
import {
  Badge,
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
} from '@pontistudios/ui';

/**
 * Break-even analysis: fixed cost vs. accumulated variable cost.
 *
 * Per-transaction fee = max(basePayment, payment × rate%)
 * Compare sum of those fees against the flat upfront cost.
 */

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

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Fee or Upfront</h2>
        <p className="text-muted-foreground">
          Two pricing models compete: pay once upfront, or pay a fee on each transaction.
          The per-transaction fee is{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">max(base, amount × rate%)</code>
          {' '}— a floor that kicks in when the percentage would be too small to cover
          processing costs.
        </p>
        <i className="text-xs text-muted-foreground">Courtesy of Goldman Sachs</i>
      </header>

      {/* Two-column pricing model comparison */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Option A: Upfront */}
        <Card className={result.choice === 'upfront' ? 'border-green-400' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Option A — Upfront</CardTitle>
              {result.choice === 'upfront' && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  cheaper
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Pay a single fixed cost regardless of transaction volume.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="upfront">Flat fee</Label>
              <Input
                id="upfront"
                type="number"
                min={0}
                value={upfront}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUpfront(e.target.value)}
              />
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold">${result.upfront.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Option B: Per-transaction */}
        <Card className={result.choice === 'per-transaction' ? 'border-green-400' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Option B — Per-transaction</CardTitle>
              {result.choice === 'per-transaction' && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  cheaper
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Pay a fee on each transaction:{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">max(base, amount × rate%)</code>
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="basePayment">Base fee</Label>
                <Input
                  id="basePayment"
                  type="number"
                  min={0}
                  value={basePayment}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBasePayment(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Floor per transaction.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rate">Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  min={0}
                  max={100}
                  value={rate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">% of each transaction.</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payments">Transactions</Label>
              <Input
                id="payments"
                value={paymentsRaw}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentsRaw(e.target.value)}
                placeholder="e.g. 100, 200, 300"
              />
              <p className="text-xs text-muted-foreground">Comma-separated amounts.</p>
            </div>
            <p className="mt-1 font-mono text-2xl font-semibold">${result.totalFees.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            <code className="text-xs bg-muted px-1 py-0.5 rounded">charge = max(base, amount × rate%)</code>
          </p>
        </CardHeader>
        <CardContent>
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
                    <Badge
                      variant="outline"
                      className={
                        row.rule === 'rate'
                          ? 'border-violet-300 text-violet-700'
                          : 'border-orange-300 text-orange-700'
                      }
                    >
                      {row.rule === 'rate' ? `${rate}% rate` : 'base fee'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/40">
                <TableCell colSpan={4} className="text-right text-muted-foreground">
                  Total per-transaction
                </TableCell>
                <TableCell className="font-mono">${result.totalFees.toFixed(2)}</TableCell>
                <TableCell />
              </TableRow>
              <TableRow className={result.choice === 'upfront' ? 'bg-green-50' : 'bg-blue-50'}>
                <TableCell colSpan={4} className="text-right font-medium">
                  Upfront —{' '}
                  {result.choice === 'upfront' ? 'cheaper by' : 'more expensive by'}{' '}
                  <span className="font-mono">${result.savings.toFixed(2)}</span>
                </TableCell>
                <TableCell className="font-mono font-semibold">${result.upfront.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      result.choice === 'upfront'
                        ? 'border-green-500 text-green-700'
                        : 'border-blue-500 text-blue-700'
                    }
                  >
                    {result.choice === 'upfront' ? 'Pay upfront' : 'Pay per-transaction'}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
