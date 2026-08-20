import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  calculateTheaterEconomics,
  DEFAULT_SCREEN_ALLOCATION,
  rebalanceAllocationForCategory,
} from "./theatre-model";
import TheaterEconomics from "./route";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const BASE_CONFIG = {
  screens: 10,
  season: "SHOULDER" as const,
  ticketPrice: 13,
  concessionPerCap: 7,
  screenAllocation: DEFAULT_SCREEN_ALLOCATION,
};

function renderRoute() {
  return render(
    <MemoryRouter>
      <TheaterEconomics />
    </MemoryRouter>,
  );
}

describe("TheaterEconomics route", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders the roster rows and keeps the lineup full when a stepper changes", async () => {
    const user = userEvent.setup();
    renderRoute();

    expect(screen.getByText("Screen Allocation")).toBeInTheDocument();
    expect(screen.getByText("Tentpole")).toBeInTheDocument();
    expect(screen.getByText("Wide Release")).toBeInTheDocument();
    expect(screen.getByText("Horror / Genre")).toBeInTheDocument();
    expect(screen.getByText("Family Matinee")).toBeInTheDocument();
    expect(screen.getByText("Indie / Holdover")).toBeInTheDocument();

    const initial = calculateTheaterEconomics(BASE_CONFIG);
    const weeklyCard = screen.getByText("Weekly Attendance").closest('[data-slot="card"]');
    expect(weeklyCard).not.toBeNull();
    expect(
      within(weeklyCard as HTMLElement).getByText(initial.weeklyAttendance.toLocaleString("en-US")),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Increase Tentpole screens" }));

    const updated = calculateTheaterEconomics({
      ...BASE_CONFIG,
      screenAllocation: rebalanceAllocationForCategory(
        DEFAULT_SCREEN_ALLOCATION,
        10,
        "TENTPOLE",
        4,
      ),
    });

    await waitFor(() => {
      expect(
        within(weeklyCard as HTMLElement).getByText(
          updated.weeklyAttendance.toLocaleString("en-US"),
        ),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Full roster locked. Shift a screen to rebalance the slate."),
    ).toBeInTheDocument();
  });
});
