import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, BarChart3, Target, TrendingUp } from "lucide-react";
import { calculateMarketingSpend, type MarketingProjectionOutput } from "~/lib/business/marketing-calculator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Input,
  Label,
  Slider,
} from "@pontistudios/ui";

const assumptions = [
  "Best for quick paid acquisition planning.",
  "Conversion rate should be entered as a realistic ticket purchase rate.",
  "Use the output as a directional planning number, then refine by channel.",
] as const;

const formulaSteps = [
  "Required clicks = desired attendees / conversion rate",
  "Projected spend = required clicks × cost per click",
] as const;

const interpretationNotes = [
  "If the projected spend feels too high, improve conversion before increasing budget.",
  "Conversion improvements usually compound faster than small CPC gains.",
  "Use this number as a planning baseline, then refine by channel mix and creative quality.",
] as const;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function MarketingCalculator() {
  const [desiredAttendees, setDesiredAttendees] = useState("500");
  const [conversionRateBasisPoints, setConversionRateBasisPoints] = useState(20);
  const [costPerClick, setCostPerClick] = useState("1.00");
  const [result, setResult] = useState<MarketingProjectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const conversionRate = conversionRateBasisPoints / 1000;

  const handleCalculate = () => {
    const attendeeCount = Number(desiredAttendees);
    const clickCost = Number(costPerClick);

    if (!Number.isFinite(attendeeCount) || attendeeCount <= 0) {
      setError("Desired attendees must be greater than 0.");
      setResult(null);
      return;
    }

    try {
      const projection = calculateMarketingSpend({
        desiredAttendees: attendeeCount,
        conversionRate,
        costPerClick: clickCost,
      });

      setResult(projection);
      setError(null);
    } catch (calculationError) {
      setResult(null);
      setError(
        calculationError instanceof Error ? calculationError.message : "Unable to calculate spend.",
      );
    }
  };

  const handleReset = () => {
    setDesiredAttendees("500");
    setConversionRateBasisPoints(20);
    setCostPerClick("1.00");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        <section className="border-b border-border pb-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Business tools</Badge>
              <Badge variant="outline">Marketing planning</Badge>
            </div>
            <h1 className="mt-4">Model the spend required to hit your attendee goal.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              This calculator gives you a clean planning view of how conversion rate and CPC shape
              the budget required to reach a target attendance number.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="outline">
                <Link to="/business-tools">
                  <ArrowLeft />
                  Back to tools
                </Link>
              </Button>
              <Button onClick={handleCalculate} size="lg">
                Calculate spend
                <ArrowRight />
              </Button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
              <div className="ui-eyebrow">Inputs</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Set the three numbers that matter.
              </h2>
              <p className="mt-3 max-w-[60ch] text-sm leading-6 text-muted-foreground">
                Start with your attendance target, then pressure-test the economics with realistic
                conversion and click cost assumptions.
              </p>

              <div className="mt-8 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="desired-attendees">Desired attendees</Label>
                    <Input
                      id="desired-attendees"
                      inputMode="numeric"
                      type="number"
                      min={1}
                      value={desiredAttendees}
                      onChange={(event) => setDesiredAttendees(event.target.value)}
                    />
                    <p className="text-sm leading-6 text-muted-foreground">
                      The number of attendees you want this campaign to produce.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost-per-click">Cost per click</Label>
                    <Input
                      id="cost-per-click"
                      inputMode="decimal"
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={costPerClick}
                      onChange={(event) => setCostPerClick(event.target.value)}
                    />
                    <p className="text-sm leading-6 text-muted-foreground">
                      Your working average CPC across the paid channels you plan to use.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Label htmlFor="conversion-rate">Conversion rate</Label>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Move this based on your current landing page or funnel performance.
                      </p>
                    </div>
                    <div className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                      {(conversionRate * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="mt-5">
                    <Slider
                      id="conversion-rate"
                      value={[conversionRateBasisPoints]}
                      onValueChange={(values) => setConversionRateBasisPoints(values[0] ?? 20)}
                      min={1}
                      max={500}
                      step={1}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">Low: 0.10%</Badge>
                    <Badge variant="secondary">Typical: 1.00%–5.00%</Badge>
                    <Badge variant="secondary">High intent: 5.00%+</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleCalculate} size="lg">
                    Calculate spend
                    <TrendingUp />
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">
                    Reset inputs
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted/20 p-6">
              <div className="ui-eyebrow">Output</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Campaign spend snapshot
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                A compact planning summary you can use in budgeting and pacing discussions.
              </p>

              <div className="mt-8 space-y-6">
                {error ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive">
                    {error}
                  </div>
                ) : result ? (
                  <>
                    <div className="border-b border-border pb-6">
                      <div className="ui-eyebrow">Projected ad spend</div>
                      <div className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                        {formatCurrency(result.projectedAdSpend)}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Estimated paid media budget needed to reach your goal with the current
                        assumptions.
                      </p>
                    </div>

                    <dl className="grid gap-4 sm:grid-cols-2">
                      <div className="border-l-2 border-border pl-4">
                        <dt className="ui-eyebrow">Required clicks</dt>
                        <dd className="mt-2 text-2xl font-semibold text-foreground">
                          {result.requiredClicks.toLocaleString()}
                        </dd>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          The traffic volume implied by your attendee target and conversion rate.
                        </p>
                      </div>
                      <div className="border-l-2 border-border pl-4">
                        <dt className="ui-eyebrow">Effective CPA</dt>
                        <dd className="mt-2 text-2xl font-semibold text-foreground">
                          {formatCurrency(result.projectedAdSpend / Number(desiredAttendees))}
                        </dd>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Average paid acquisition cost per attendee under this scenario.
                        </p>
                      </div>
                    </dl>
                  </>
                ) : (
                  <div className="border-l-2 border-dashed border-border pl-4">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="mt-0.5 size-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium text-foreground">No calculation yet</h3>
                        <p className="mt-2 max-w-[48ch] text-sm leading-6 text-muted-foreground">
                          Enter your planning assumptions and calculate to see the required clicks
                          and projected spend.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border px-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="assumptions">
                <AccordionTrigger index={0}>Planning assumptions</AccordionTrigger>
                <AccordionContent className="pb-0 pl-0">
                  <div className="grid gap-3 md:grid-cols-3">
                    {assumptions.map((assumption) => (
                      <div key={assumption} className="border-l-2 border-border pl-4 text-sm leading-6 text-muted-foreground">
                        {assumption}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="method">
                <AccordionTrigger index={1}>Calculation method</AccordionTrigger>
                <AccordionContent className="pb-0 pl-0">
                  <div className="grid gap-3">
                    {formulaSteps.map((step) => (
                      <div key={step} className="border-l-2 border-border pl-4 text-sm leading-6 text-foreground">
                        {step}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="interpretation">
                <AccordionTrigger index={2}>How to read the output</AccordionTrigger>
                <AccordionContent className="pb-0 pl-0">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-start gap-3 border-l-2 border-border pl-4">
                      <Target className="mt-0.5 size-4 text-muted-foreground" />
                      <p className="text-sm leading-6 text-muted-foreground">{interpretationNotes[0]}</p>
                    </div>
                    <div className="flex items-start gap-3 border-l-2 border-border pl-4">
                      <TrendingUp className="mt-0.5 size-4 text-muted-foreground" />
                      <p className="text-sm leading-6 text-muted-foreground">{interpretationNotes[1]}</p>
                    </div>
                    <div className="border-l-2 border-border pl-4 text-sm leading-6 text-muted-foreground">
                      {interpretationNotes[2]}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
