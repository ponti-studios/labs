import { useMemo } from "react";

import {
  calculateTheaterEconomics,
  clamp,
  DEFAULT_SCREEN_ALLOCATION,
  rebalanceAllocationForCategory,
  rebalanceAllocationForScreens,
  type FilmCategory,
  type ScreenAllocationMap,
  type SeasonKey,
  type TheaterInputs,
} from "./theatre-model";

// ─── Reducer ───────────────────────────────────────────────────────────────────

export type TheaterAction =
  | { type: "SET_SCREENS"; payload: number }
  | { type: "SET_SEASON"; payload: SeasonKey }
  | { type: "SET_TICKET_PRICE"; payload: number }
  | { type: "SET_CONCESSION_PPC"; payload: number }
  | { type: "SET_SCREEN_ALLOCATION"; category: FilmCategory; screens: number };

export const INITIAL_CONFIG: TheaterInputs = {
  screens: 10,
  season: "SHOULDER",
  ticketPrice: 13,
  concessionPerCap: 7,
  screenAllocation: DEFAULT_SCREEN_ALLOCATION,
};

export function theaterReducer(state: TheaterInputs, action: TheaterAction): TheaterInputs {
  switch (action.type) {
    case "SET_SCREENS": {
      const screens = clamp(action.payload, 4, 20);
      return {
        ...state,
        screens,
        screenAllocation: rebalanceAllocationForScreens(state.screenAllocation, screens),
      };
    }
    case "SET_SEASON":
      return { ...state, season: action.payload };
    case "SET_TICKET_PRICE":
      return { ...state, ticketPrice: clamp(action.payload, 10, 20) };
    case "SET_CONCESSION_PPC":
      return { ...state, concessionPerCap: clamp(action.payload, 4, 12) };
    case "SET_SCREEN_ALLOCATION":
      return {
        ...state,
        screenAllocation: rebalanceAllocationForCategory(
          state.screenAllocation,
          state.screens,
          action.category,
          action.screens,
        ),
      };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmt(n: number) {
  return n.toLocaleString();
}

export function formatCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return formatCurrency(n);
}

export function getHealthStatus(monthlyProfit: number, grossRevenue: number) {
  if (grossRevenue === 0) return { label: "No data", variant: "muted" as const };
  const margin = monthlyProfit / grossRevenue;
  if (margin > 0.05) return { label: "Healthy", variant: "success" as const };
  if (margin > -0.05) return { label: "Break even", variant: "warning" as const };
  return { label: "Losing money", variant: "destructive" as const };
}

export function utilizationVariant(pct: number) {
  if (pct > 90) return "destructive" as const;
  if (pct > 70) return "warning" as const;
  return "success" as const;
}

export const CAPACITY_STYLES = {
  success: { bar: "bg-success", text: "text-success" },
  warning: { bar: "bg-warning", text: "text-warning" },
  destructive: { bar: "bg-destructive", text: "text-destructive" },
} as const;

export const HEALTH_STYLES = {
  success: { text: "text-success", dot: "bg-success" },
  warning: { text: "text-warning", dot: "bg-warning" },
  destructive: { text: "text-destructive", dot: "bg-destructive" },
  muted: { text: "text-secondary", dot: "bg-inset-foreground" },
} as const;

export function projectedImpactLabel(multiplier: number) {
  const delta = Math.round((multiplier - 1) * 100);
  return `${delta >= 0 ? "+" : ""}${delta}% demand`;
}

// ─── Calculator Hook ───────────────────────────────────────────────────────────

export function useCalculator(config: TheaterInputs) {
  return useMemo(() => calculateTheaterEconomics(config), [config]);
}
