import { Badge, Card, CardContent, CardHeader } from "@ponti-studios/ui/primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stepper,
} from "@ponti-studios/ui/forms";
import { cn } from "~/lib/utils";
import { Clapperboard } from "lucide-react";
import {
  FILM_CATEGORIES,
  FILM_CATEGORY_ORDER,
  SEASON_OPTIONS,
  type FilmCategory,
  type ScreenAllocationMap,
  type SeasonKey,
} from "../theatre-model";
import { projectedImpactLabel } from "../utils";

export function ScreenAllocation({
  screens,
  allocation,
  season,
  onScreensChange,
  onSeasonChange,
  onAllocationChange,
}: {
  screens: number;
  allocation: ScreenAllocationMap;
  season: SeasonKey;
  onScreensChange: (screens: number) => void;
  onSeasonChange: (season: SeasonKey) => void;
  onAllocationChange: (category: FilmCategory, screens: number) => void;
}) {
  const allocatedScreens = FILM_CATEGORY_ORDER.reduce(
    (sum, category) => sum + allocation[category],
    0,
  );

  return (
    <Card>
      <CardHeader className="px-5 py-4">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="ui-data-label">Screen Allocation</span>
              <Clapperboard className="text-secondary size-4" />
            </div>
            <p className="text-secondary mt-1 text-xs">Roster your screens like a weekly lineup.</p>
          </div>
          <div className="text-right">
            <div className="text-primary font-mono text-sm font-semibold tabular-nums">
              {allocatedScreens}/{screens}
            </div>
            <div className="text-secondary text-[11px]">screens assigned</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 py-5">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <label className="text-secondary text-sm font-medium">Screens</label>
              <Stepper
                value={screens}
                min={4}
                max={20}
                onChange={onScreensChange}
                decreaseLabel="Decrease total screens"
                increaseLabel="Increase total screens"
              />
            </div>
            <p className="text-secondary text-xs">
              The roster rebalances automatically as the house grows or shrinks.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="season" className="text-secondary text-sm font-medium">
                Season
              </label>
              <span className="text-secondary text-xs tabular-nums">
                {SEASON_OPTIONS[season].multiplier.toFixed(2)}x
              </span>
            </div>
            <Select value={season} onValueChange={(value) => onSeasonChange(value as SeasonKey)}>
              <SelectTrigger id="season" aria-label="Season" className="w-full">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEASON_OPTIONS).map(([seasonValue, option]) => (
                  <SelectItem key={seasonValue} value={seasonValue}>
                    {option.label} · {option.multiplier.toFixed(2)}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-secondary text-xs">Simple seasonal multiplier.</p>
          </div>
        </div>

        <div className="space-y-3">
          {FILM_CATEGORY_ORDER.map((category, index) => {
            const film = FILM_CATEGORIES[category];
            const screenCount = allocation[category];

            return (
              <div
                key={category}
                className={cn(
                  "grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center",
                  index > 0 && "border-subtle border-t pt-3",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-primary text-sm font-semibold">{film.label}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {film.role}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {projectedImpactLabel(film.demandMultiplier)}
                    </Badge>
                  </div>
                  <div className="text-secondary mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                    <span>Studio {Math.round(film.studioCut * 100)}%</span>
                    <span>Concessions {Math.round(film.concessionMultiplier * 100)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Stepper
                    value={screenCount}
                    min={0}
                    max={screens}
                    onChange={(value) => onAllocationChange(category, value)}
                    decreaseLabel={`Decrease ${film.label} screens`}
                    increaseLabel={`Increase ${film.label} screens`}
                  />
                </div>
              </div>
            );
          })}

          <p className="text-secondary text-xs">
            {allocatedScreens === screens
              ? "Full roster locked. Shift a screen to rebalance the slate."
              : `${screens - allocatedScreens} screens remain unassigned.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
