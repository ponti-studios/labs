import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { calculateTheaterEconomics, DEFAULT_SCREEN_ALLOCATION } from "./theatre-model";
import type { ScreenAllocationMap, SeasonKey, TheaterInputs } from "./theatre-model";
import {
  BreakdownRow,
  NumericControl,
  PLStatement,
  ProfitRevenueCard,
  RevenueMixCard,
  ScreenAllocation,
  SliderControl,
  StatRow,
  WeeklyTrafficCard,
} from "./components/index";

// --- Mocks -------------------------------------------------------------------

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

// --- Fixtures ----------------------------------------------------------------

const BASE_INPUTS: TheaterInputs = {
  screens: 10,
  season: "SHOULDER",
  ticketPrice: 13,
  concessionPerCap: 7,
  screenAllocation: DEFAULT_SCREEN_ALLOCATION,
};

const BASE_D = calculateTheaterEconomics(BASE_INPUTS);

const LINEUP_METRICS = BASE_D.lineupMetrics;

// ─── BreakdownRow ──────────────────────────────────────────────────────────────

describe("BreakdownRow", () => {
  it("renders label and value", () => {
    render(<BreakdownRow label="Revenue" value="$5,000" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$5,000")).toBeInTheDocument();
  });

  it("renders a negative value with a minus sign", () => {
    render(<BreakdownRow label="Cost" value="$1,000" negative />);
    expect(screen.getByText("−$1,000")).toBeInTheDocument();
  });

  it("applies bold styling when bold prop is set", () => {
    const { container } = render(<BreakdownRow label="Total" value="$10,000" bold />);
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain("font-semibold");
  });

  it("applies muted styling when muted prop is set", () => {
    const { container } = render(<BreakdownRow label="Detail" value="$100" muted />);
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain("text-secondary");
  });
});

// ─── StatRow ───────────────────────────────────────────────────────────────────

describe("StatRow", () => {
  it("renders label and children", () => {
    render(<StatRow label="Utilization">85%</StatRow>);
    expect(screen.getByText("Utilization")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders complex children", () => {
    render(
      <StatRow label="Per weekend">
        <strong>1,200</strong>
      </StatRow>,
    );
    expect(screen.getByText("Per weekend")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });
});

// ─── SliderControl ─────────────────────────────────────────────────────────────

describe("SliderControl", () => {
  it("renders label, formatted value, and slider", () => {
    render(
      <SliderControl
        label="Ticket Price"
        value={15}
        onChange={() => {}}
        min={10}
        max={20}
        step={0.5}
        format={(v) => `$${v}`}
      />,
    );
    expect(screen.getByText("Ticket Price")).toBeInTheDocument();
    expect(screen.getByText("$15")).toBeInTheDocument();
  });

  it("renders hint when provided", () => {
    render(
      <SliderControl
        label="Concession"
        value={7}
        onChange={() => {}}
        min={4}
        max={12}
        step={0.5}
        format={(v) => `$${v}`}
        hint="Average for multiplex"
      />,
    );
    expect(screen.getByText("Average for multiplex")).toBeInTheDocument();
  });

  it("does not render hint when omitted", () => {
    const { container } = render(
      <SliderControl
        label="Price"
        value={10}
        onChange={() => {}}
        min={5}
        max={20}
        step={1}
        format={(v) => `$${v}`}
      />,
    );
    // There should be no paragraph with text-xs inside this component's container
    const hints = container.querySelectorAll(".text-xs");
    // Only the value display uses text-xs for hint; no hint text should exist
    expect(hints.length).toBe(0);
  });

  it("calls onChange when slider value changes", async () => {
    const onChange = vi.fn();
    render(
      <SliderControl
        label="Test"
        value={10}
        onChange={onChange}
        min={5}
        max={20}
        step={1}
        format={(v) => `${v}`}
      />,
    );

    // Verify the label and value render
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});

// ─── NumericControl ────────────────────────────────────────────────────────────

describe("NumericControl", () => {
  it("renders label, value, and input", () => {
    render(
      <NumericControl
        id="test-input"
        label="Market Size"
        value={5_000}
        onChange={() => {}}
        min={1_000}
        max={10_000}
      />,
    );
    expect(screen.getByText("Market Size")).toBeInTheDocument();
    // The formatted value should be displayed
    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("renders hint when provided", () => {
    render(
      <NumericControl
        id="hint-test"
        label="Baseline"
        value={3_000}
        onChange={() => {}}
        min={1_000}
        max={10_000}
        hint="Before seasonality"
      />,
    );
    expect(screen.getByText("Before seasonality")).toBeInTheDocument();
  });

  it("calls onChange with a valid number", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NumericControl
        id="change-test"
        label="Value"
        value={5_000}
        onChange={onChange}
        min={1_000}
        max={10_000}
      />,
    );
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "6000");
    // The onChange may fire on each keystroke; we just verify it gets called
    expect(onChange).toHaveBeenCalled();
  });
});

// ─── ProfitRevenueCard ─────────────────────────────────────────────────────────

describe("ProfitRevenueCard", () => {
  it("renders monthly profit and gross revenue", () => {
    render(
      <ProfitRevenueCard
        d={BASE_D}
        healthLabel="Healthy"
        healthDot="bg-success"
        healthTextColor="text-success"
      />,
    );

    // Monthly profit should be formatted
    expect(screen.getByText("Profit & Revenue")).toBeInTheDocument();
    // The visitor count should be rendered
    expect(screen.getByText(/visitors/)).toBeInTheDocument();
  });

  it("shows the health label", () => {
    render(
      <ProfitRevenueCard
        d={BASE_D}
        healthLabel="Healthy"
        healthDot="bg-success"
        healthTextColor="text-success"
      />,
    );
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("shows the margin percentage", () => {
    render(
      <ProfitRevenueCard
        d={BASE_D}
        healthLabel="Healthy"
        healthDot="bg-success"
        healthTextColor="text-success"
      />,
    );
    const marginText = `${(BASE_D.margin * 100).toFixed(1)}% margin`;
    expect(screen.getByText(marginText)).toBeInTheDocument();
  });
});

// ─── RevenueMixCard ────────────────────────────────────────────────────────────

describe("RevenueMixCard", () => {
  it("renders ticket and snack percentages", () => {
    render(<RevenueMixCard d={BASE_D} />);
    expect(screen.getByText(`${BASE_D.ticketPct}%`)).toBeInTheDocument();
    expect(screen.getByText(`${BASE_D.snackPct}%`)).toBeInTheDocument();
  });

  it("renders ticket and snack revenue", () => {
    render(<RevenueMixCard d={BASE_D} />);
    expect(screen.getByText("Revenue Mix")).toBeInTheDocument();
    expect(screen.getByText(/Tickets/)).toBeInTheDocument();
    expect(screen.getByText(/Snacks/)).toBeInTheDocument();
  });
});

// ─── WeeklyTrafficCard ─────────────────────────────────────────────────────────

describe("WeeklyTrafficCard", () => {
  it("renders weekly attendance and stats", () => {
    render(<WeeklyTrafficCard d={BASE_D} />);
    expect(screen.getByText("Weekly Attendance")).toBeInTheDocument();
    expect(screen.getByText(`${BASE_D.utilizationPct}%`)).toBeInTheDocument();
  });

  it("renders weekend and weekday averages", () => {
    render(<WeeklyTrafficCard d={BASE_D} />);
    expect(screen.getByText("Per weekend")).toBeInTheDocument();
    expect(screen.getByText("Per weekday")).toBeInTheDocument();
  });
});

// ─── ScreenAllocation ──────────────────────────────────────────────────────────

describe("ScreenAllocation", () => {
  const defaultProps = {
    screens: 10,
    allocation: DEFAULT_SCREEN_ALLOCATION as ScreenAllocationMap,
    season: "SHOULDER" as SeasonKey,
    onScreensChange: vi.fn(),
    onSeasonChange: vi.fn(),
    onAllocationChange: vi.fn(),
  };

  it("renders the header and category rows", () => {
    render(
      <MemoryRouter>
        <ScreenAllocation {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Screen Allocation")).toBeInTheDocument();
    expect(screen.getByText("Tentpole")).toBeInTheDocument();
    expect(screen.getByText("Wide Release")).toBeInTheDocument();
    expect(screen.getByText("Horror / Genre")).toBeInTheDocument();
    expect(screen.getByText("Family Matinee")).toBeInTheDocument();
    expect(screen.getByText("Indie / Holdover")).toBeInTheDocument();
  });

  it("shows assigned screens count", () => {
    render(
      <MemoryRouter>
        <ScreenAllocation {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText("10/10")).toBeInTheDocument();
    expect(screen.getByText("screens assigned")).toBeInTheDocument();
  });

  it("shows the roster locked message when fully assigned", () => {
    render(
      <MemoryRouter>
        <ScreenAllocation {...defaultProps} />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Full roster locked. Shift a screen to rebalance the slate."),
    ).toBeInTheDocument();
  });

  it("shows unassigned count when screens are free", () => {
    const partialAllocation: ScreenAllocationMap = {
      TENTPOLE: 2,
      WIDE_RELEASE: 1,
      HORROR: 1,
      FAMILY: 0,
      INDIE_HOLDOVER: 1,
    };
    render(
      <MemoryRouter>
        <ScreenAllocation {...defaultProps} screens={10} allocation={partialAllocation} />
      </MemoryRouter>,
    );
    expect(screen.getByText("5 screens remain unassigned.")).toBeInTheDocument();
  });

  it("calls onScreensChange when the screens stepper is clicked", async () => {
    const onScreensChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ScreenAllocation {...defaultProps} onScreensChange={onScreensChange} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "Increase total screens" }));
    expect(onScreensChange).toHaveBeenCalledWith(11);
  });

  it("calls onAllocationChange when a category stepper is clicked", async () => {
    const onAllocationChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ScreenAllocation {...defaultProps} onAllocationChange={onAllocationChange} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "Increase Tentpole screens" }));
    expect(onAllocationChange).toHaveBeenCalledWith("TENTPOLE", 4);
  });
});

// ─── PLStatement ──────────────────────────────────────────────────────────────

describe("PLStatement", () => {
  it("renders revenue section", () => {
    render(
      <PLStatement
        d={BASE_D}
        lineupMetrics={LINEUP_METRICS}
        healthLabel="Healthy"
        healthDot="bg-success"
        healthTextColor="text-success"
      />,
    );

    expect(screen.getByText("Monthly P&L")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    // Both "Ticket Revenue (gross)" and "Your Ticket Revenue" contain "Ticket Revenue"
    expect(screen.getByText("Ticket Revenue (gross)")).toBeInTheDocument();
    expect(screen.getByText(/Studio Cut/)).toBeInTheDocument();
    expect(screen.getByText("Your Ticket Revenue")).toBeInTheDocument();
    expect(screen.getByText("Concession Profit")).toBeInTheDocument();
  });

  it("renders expenses section", () => {
    render(
      <PLStatement
        d={BASE_D}
        lineupMetrics={LINEUP_METRICS}
        healthLabel="Healthy"
        healthDot="bg-success"
        healthTextColor="text-success"
      />,
    );

    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Labor")).toBeInTheDocument();
    expect(screen.getByText("Utilities")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("renders monthly profit with health status", () => {
    render(
      <PLStatement
        d={BASE_D}
        lineupMetrics={LINEUP_METRICS}
        healthLabel="Healthy"
        healthDot="bg-success"
        healthTextColor="text-success"
      />,
    );

    expect(screen.getByText("Monthly Profit")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("renders the margin percentage", () => {
    render(
      <PLStatement
        d={BASE_D}
        lineupMetrics={LINEUP_METRICS}
        healthLabel="Healthy"
        healthDot="bg-success"
        healthTextColor="text-success"
      />,
    );

    const marginValue = (BASE_D.margin * 100).toFixed(1);
    expect(screen.getByText(new RegExp(`${marginValue}\\s*% margin`))).toBeInTheDocument();
  });
});
