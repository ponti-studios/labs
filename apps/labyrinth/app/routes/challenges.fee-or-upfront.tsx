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
 * Given a series of transactions, each incurring a variable fee, determine
 * whether paying a single upfront fee is cheaper than paying per-transaction.
 *
 * Per-transaction fee = max(basePayment, payment × rate%)
 * Compare sum of those fees against the flat upfront cost.
 *
 * The same principle applies anywhere two pricing models compete:
 * cloud reserved vs. on-demand, SaaS annual vs. monthly, lease vs. buy.
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
          Given a series of transactions, should you pay a flat upfront fee or a fee on each
          transaction? For each transaction the per-transaction cost is{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            max(basePayment, amount × rate%)
          </code>
          . Compare the total of those fees against the flat upfront cost.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          This is a break-even analysis — the same principle behind cloud reserved vs. on-demand,
          annual vs. monthly SaaS subscriptions, or leasing vs. buying.
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
              <p className="text-xs text-muted-foreground">Minimum fee per transaction.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate">Rate (x%)</Label>
              <Input
                id="rate"
                type="number"
                min={0}
                max={100}
                value={rate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Percentage of each transaction.</p>
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
              <p className="text-xs text-muted-foreground">One-time flat cost.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payments">Transactions (p)</Label>
              <Input
                id="payments"
                value={paymentsRaw}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPaymentsRaw(e.target.value)}
                placeholder="e.g. 100, 200, 300"
              />
              <p className="text-xs text-muted-foreground">Comma-separated amounts.</p>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Total per-transaction fees
                </p>
                <p className="text-2xl font-semibold font-mono">${result.totalFees.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Upfront cost
                </p>
                <p className="text-2xl font-semibold font-mono">${result.upfront.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card
              className={
                result.choice === 'upfront'
                  ? 'border-green-400 bg-green-50'
                  : 'border-blue-400 bg-blue-50'
              }
            >
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Recommendation
                </p>
                <Badge
                  variant="outline"
                  className={
                    result.choice === 'upfront'
                      ? 'border-green-500 text-green-700 text-sm px-3 py-1'
                      : 'border-blue-500 text-blue-700 text-sm px-3 py-1'
                  }
                >
                  {result.choice === 'upfront' ? 'Pay upfront' : 'Pay per-transaction'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  saves ${result.savings.toFixed(2)} vs the alternative
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each row: <code className="text-xs bg-muted px-1 py-0.5 rounded">charge = max(k, amount × x%)</code>
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>{rate}% of amount</TableHead>
                    <TableHead>Base fee (k)</TableHead>
                    <TableHead>Charged</TableHead>
                    <TableHead>Rule</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row, i) => (
                    <TableRow
                      key={i}
                      style={{ animation: 'fade-slide-in 300ms ease-out both', animationDelay: `${i * 60}ms` }}
                    >
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
                    <TableCell colSpan={4} className="text-right text-muted-foreground">Total</TableCell>
                    <TableCell className="font-mono">${result.totalFees.toFixed(2)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
