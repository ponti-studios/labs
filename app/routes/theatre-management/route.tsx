import { Card, CardContent, CardHeader } from "@ponti-studios/ui/primitives";
import { DollarSign } from "lucide-react";
import { useReducer } from "react";
import { Link } from "react-router";

import {
  PLStatement,
  ProfitRevenueCard,
  RevenueMixCard,
  ScreenAllocation,
  SliderControl,
  WeeklyTrafficCard,
} from "./components/index";
import {
  fmt,
  formatCurrency,
  getHealthStatus,
  HEALTH_STYLES,
  INITIAL_CONFIG,
  theaterReducer,
  useCalculator,
} from "./utils";

// ─── Route Component ──────────────────────────────────────────────────────────

export default function TheaterEconomics() {
  const [config, dispatch] = useReducer(theaterReducer, INITIAL_CONFIG);

  const d = useCalculator(config);
  const health = getHealthStatus(d.monthlyProfit, d.grossRevenue);
  const hs = HEALTH_STYLES[health.variant];
  const lineupMetrics = d.lineupMetrics;

  return (
    <main className="storefront-main sf-theatre-page">
      <header className="sf-wrap sf-theatre-intro">
        <Link to="/playground/essays#theatre-management" className="sf-calendar-back">
          ← Essays
        </Link>
        <h1 className="sf-h1">The Ledger Behind the Curtain.</h1>
        <p className="sf-copy">
          See how ticket prices, concessions and screen allocation shape a theatre’s monthly
          P&amp;L.
        </p>
      </header>

      <div className="sf-wrap sf-theatre-dashboard">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <ProfitRevenueCard
            d={d}
            healthLabel={health.label}
            healthDot={hs.dot}
            healthTextColor={hs.text}
          />
          <RevenueMixCard d={d} />
          <WeeklyTrafficCard d={d} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <ScreenAllocation
              screens={config.screens}
              allocation={config.screenAllocation}
              season={config.season}
              onScreensChange={(screens) => dispatch({ type: "SET_SCREENS", payload: screens })}
              onSeasonChange={(season) => dispatch({ type: "SET_SEASON", payload: season })}
              onAllocationChange={(category, screens) =>
                dispatch({ type: "SET_SCREEN_ALLOCATION", category, screens })
              }
            />

            <Card>
              <CardHeader className="px-5 py-4">
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="ui-data-label">Pricing</span>
                  <DollarSign className="text-muted-foreground size-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-5 py-5">
                <SliderControl
                  label="Average Ticket Price"
                  value={config.ticketPrice}
                  onChange={(v) => dispatch({ type: "SET_TICKET_PRICE", payload: v })}
                  min={10}
                  max={20}
                  step={0.5}
                  format={formatCurrency}
                />
                <SliderControl
                  label="Concession Per Cap (SPP)"
                  value={config.concessionPerCap}
                  onChange={(v) => dispatch({ type: "SET_CONCESSION_PPC", payload: v })}
                  min={4}
                  max={12}
                  step={0.5}
                  format={formatCurrency}
                  hint="Spend per patron — conventional multiplex avg $6–$9"
                />

                <div className="border-border border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-semibold">Total Monthly Expenses</span>
                    <span className="text-foreground font-sans text-lg font-semibold tabular-nums">
                      {formatCurrency(d.totalExpenses)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    Labor = $20k base + $2.22 × {fmt(d.monthlyVisitors)} visitors
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <PLStatement
              d={d}
              lineupMetrics={lineupMetrics}
              healthLabel={health.label}
              healthDot={hs.dot}
              healthTextColor={hs.text}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
