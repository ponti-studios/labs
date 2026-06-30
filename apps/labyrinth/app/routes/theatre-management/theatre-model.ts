export type FilmCategory = "TENTPOLE" | "WIDE_RELEASE" | "HORROR" | "FAMILY" | "INDIE_HOLDOVER";

export type ScreenAllocationMap = Record<FilmCategory, number>;

export type SeasonKey = "OFF_PEAK" | "SHOULDER" | "SUMMER" | "HOLIDAY";

export interface TheaterInputs {
  screens: number;
  marketBaseline: number;
  season: SeasonKey;
  ticketPrice: number;
  concessionPerCap: number;
  screenAllocation: ScreenAllocationMap;
}

export interface LineupMetrics {
  allocatedScreens: number;
  lineupDemandMultiplier: number;
  studioCutRate: number;
  concessionMultiplier: number;
}

export interface TheaterEconomics {
  lineupMetrics: LineupMetrics;
  marketAdjustedAttendance: number;
  weeklyAttendance: number;
  monthlyVisitors: number;
  weekendDailyAvg: number;
  weekdayDailyAvg: number;
  utilizationPct: number;
  grossTicketRevenue: number;
  studioCutAmount: number;
  theaterTicketRevenue: number;
  concessionProfit: number;
  grossRevenue: number;
  dynamicLabor: number;
  totalExpenses: number;
  monthlyProfit: number;
  ticketPct: number;
  snackPct: number;
  margin: number;
}

export const SCREEN_CAPACITY = 1_000;

export const MONTHLY_RENT = 25_000;
export const MONTHLY_UTILITIES = 8_000;
export const MONTHLY_OTHER = 5_000;
export const FIXED_LABOR_BASE = 20_000;
export const VARIABLE_LABOR_PER_PATRON = 2.22;
export const CONCESSION_MARGIN = 0.7;

export const DEFAULT_SCREEN_ALLOCATION: ScreenAllocationMap = {
  TENTPOLE: 3,
  WIDE_RELEASE: 2,
  HORROR: 2,
  FAMILY: 1,
  INDIE_HOLDOVER: 2,
};

export const FILM_CATEGORIES: Record<
  FilmCategory,
  {
    label: string;
    role: string;
    studioCut: number;
    demandMultiplier: number;
    concessionMultiplier: number;
  }
> = {
  TENTPOLE: {
    label: "Tentpole",
    role: "Traffic driver",
    studioCut: 0.62,
    demandMultiplier: 1.18,
    concessionMultiplier: 1.02,
  },
  WIDE_RELEASE: {
    label: "Wide Release",
    role: "Stable floor",
    studioCut: 0.53,
    demandMultiplier: 1,
    concessionMultiplier: 1,
  },
  HORROR: {
    label: "Horror / Genre",
    role: "Margin play",
    studioCut: 0.48,
    demandMultiplier: 0.92,
    concessionMultiplier: 1.12,
  },
  FAMILY: {
    label: "Family Matinee",
    role: "Concessions boost",
    studioCut: 0.5,
    demandMultiplier: 0.88,
    concessionMultiplier: 1.22,
  },
  INDIE_HOLDOVER: {
    label: "Indie / Holdover",
    role: "Terms advantage",
    studioCut: 0.45,
    demandMultiplier: 0.72,
    concessionMultiplier: 0.86,
  },
};

export const FILM_CATEGORY_ORDER = Object.keys(FILM_CATEGORIES) as FilmCategory[];

export const SEASON_OPTIONS: Record<
  SeasonKey,
  {
    label: string;
    multiplier: number;
  }
> = {
  OFF_PEAK: {
    label: "Off-peak",
    multiplier: 0.88,
  },
  SHOULDER: {
    label: "Shoulder",
    multiplier: 1,
  },
  SUMMER: {
    label: "Summer",
    multiplier: 1.08,
  },
  HOLIDAY: {
    label: "Holiday",
    multiplier: 1.16,
  },
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createEmptyAllocation(): ScreenAllocationMap {
  return {
    TENTPOLE: 0,
    WIDE_RELEASE: 0,
    HORROR: 0,
    FAMILY: 0,
    INDIE_HOLDOVER: 0,
  };
}

function getWeightTotal(
  allocation: ScreenAllocationMap,
  categories: readonly FilmCategory[] = FILM_CATEGORY_ORDER,
) {
  return categories.reduce((sum, category) => sum + allocation[category], 0);
}

function scaleAllocation(
  weights: ScreenAllocationMap,
  screens: number,
  categories: readonly FilmCategory[] = FILM_CATEGORY_ORDER,
) {
  const next = createEmptyAllocation();

  if (screens <= 0 || categories.length === 0) {
    return next;
  }

  const sourceTotal = getWeightTotal(weights, categories);
  const source = sourceTotal > 0 ? weights : DEFAULT_SCREEN_ALLOCATION;
  const sourceWeightTotal = getWeightTotal(source, categories);

  if (sourceWeightTotal <= 0) {
    const base = Math.floor(screens / categories.length);
    let remainder = screens % categories.length;

    for (const category of categories) {
      next[category] = base + (remainder > 0 ? 1 : 0);
      remainder -= 1;
    }

    return next;
  }

  const slices = categories.map((category, index) => {
    const exact = (source[category] * screens) / sourceWeightTotal;
    const floor = Math.floor(exact);

    return {
      category,
      index,
      floor,
      remainder: exact - floor,
    };
  });

  let assigned = 0;

  for (const slice of slices) {
    next[slice.category] = slice.floor;
    assigned += slice.floor;
  }

  let remainder = screens - assigned;
  const sorted = [...slices].sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (let index = 0; index < remainder; index += 1) {
    next[sorted[index].category] += 1;
  }

  return next;
}

export function getAllocatedScreens(allocation: ScreenAllocationMap) {
  return FILM_CATEGORY_ORDER.reduce((sum, category) => sum + allocation[category], 0);
}

export function rebalanceAllocationForScreens(allocation: ScreenAllocationMap, screens: number) {
  return scaleAllocation(allocation, screens);
}

export function rebalanceAllocationForCategory(
  allocation: ScreenAllocationMap,
  screens: number,
  category: FilmCategory,
  nextScreens: number,
) {
  const target = clamp(nextScreens, 0, screens);
  const remainder = screens - target;
  const others = FILM_CATEGORY_ORDER.filter((entry) => entry !== category);
  const next = scaleAllocation(allocation, remainder, others);
  next[category] = target;
  return next;
}

export function getLineupMetrics(allocation: ScreenAllocationMap): LineupMetrics {
  const allocatedScreens = getAllocatedScreens(allocation);

  if (allocatedScreens === 0) {
    return {
      allocatedScreens,
      lineupDemandMultiplier: 0,
      studioCutRate: 0,
      concessionMultiplier: 0,
    };
  }

  return FILM_CATEGORY_ORDER.reduce(
    (metrics, category) => {
      const screens = allocation[category];
      const weight = screens / allocatedScreens;
      const film = FILM_CATEGORIES[category];

      return {
        allocatedScreens,
        studioCutRate: metrics.studioCutRate + film.studioCut * weight,
        lineupDemandMultiplier: metrics.lineupDemandMultiplier + film.demandMultiplier * weight,
        concessionMultiplier: metrics.concessionMultiplier + film.concessionMultiplier * weight,
      };
    },
    {
      allocatedScreens,
      lineupDemandMultiplier: 0,
      studioCutRate: 0,
      concessionMultiplier: 0,
    },
  );
}

export function calculateTheaterEconomics(inputs: TheaterInputs): TheaterEconomics {
  const lineupMetrics = getLineupMetrics(inputs.screenAllocation);
  const seasonMultiplier = SEASON_OPTIONS[inputs.season].multiplier;
  const maxCapacity = Math.max(inputs.screens * SCREEN_CAPACITY, 1);
  const marketAdjustedAttendance = Math.round(inputs.marketBaseline * seasonMultiplier);
  const weeklyAttendance = Math.min(
    Math.round(marketAdjustedAttendance * lineupMetrics.lineupDemandMultiplier),
    maxCapacity,
  );
  const monthlyVisitors = Math.round((weeklyAttendance * 30) / 7);
  const weekendDailyAvg = Math.round((weeklyAttendance * 0.75) / 3);
  const weekdayDailyAvg = Math.round((weeklyAttendance * 0.25) / 4);
  const utilizationPct = Math.round((weeklyAttendance / maxCapacity) * 100);

  const grossTicketRevenue = monthlyVisitors * inputs.ticketPrice;
  const studioCutAmount = grossTicketRevenue * lineupMetrics.studioCutRate;
  const theaterTicketRevenue = grossTicketRevenue - studioCutAmount;
  const concessionProfit =
    monthlyVisitors *
    inputs.concessionPerCap *
    lineupMetrics.concessionMultiplier *
    CONCESSION_MARGIN;
  const grossRevenue = theaterTicketRevenue + concessionProfit;

  const dynamicLabor = Math.round(FIXED_LABOR_BASE + monthlyVisitors * VARIABLE_LABOR_PER_PATRON);
  const totalExpenses = MONTHLY_RENT + dynamicLabor + MONTHLY_UTILITIES + MONTHLY_OTHER;
  const monthlyProfit = Math.round(grossRevenue - totalExpenses);

  const ticketPct = grossRevenue > 0 ? Math.round((theaterTicketRevenue / grossRevenue) * 100) : 0;
  const snackPct = grossRevenue > 0 ? Math.round((concessionProfit / grossRevenue) * 100) : 0;
  const margin = grossRevenue > 0 ? monthlyProfit / grossRevenue : 0;

  return {
    lineupMetrics,
    marketAdjustedAttendance,
    weeklyAttendance,
    monthlyVisitors,
    weekendDailyAvg,
    weekdayDailyAvg,
    utilizationPct,
    grossTicketRevenue,
    studioCutAmount,
    theaterTicketRevenue,
    concessionProfit,
    grossRevenue,
    dynamicLabor,
    totalExpenses,
    monthlyProfit,
    ticketPct,
    snackPct,
    margin,
  };
}
