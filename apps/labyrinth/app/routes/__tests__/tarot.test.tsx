import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DAILY_TAROT_CARDS } from "../../lib/tarot-cards";
import {
  buildFallbackDailyReading,
  getDailyTarotStorageKey,
  getLocalDateKey,
} from "../../lib/tarot-daily";
import type { DailyTarotResult } from "../../lib/tarot-types";
import TarotRoute from "../tarot";

const sampleCard = DAILY_TAROT_CARDS[0];

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

function createResult(date: string): DailyTarotResult {
  return {
    date,
    card: sampleCard,
    reading: buildFallbackDailyReading(sampleCard, date),
    source: "curated",
  };
}

function renderRoute() {
  return render(
    <MemoryRouter>
      <TarotRoute />
    </MemoryRouter>,
  );
}

describe("TarotRoute", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-05-22T12:00:00.000"));
    const localStorage = createMemoryStorage();
    vi.stubGlobal("localStorage", localStorage);
    Object.defineProperty(window, "localStorage", {
      value: localStorage,
      configurable: true,
    });
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("draws a daily card and persists it locally", async () => {
    const dateKey = getLocalDateKey();
    const result = createResult(dateKey);

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await act(async () => {
      renderRoute();
    });

    fireEvent.click(screen.getByRole("button", { name: "Draw today’s card" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: result.card.name, level: 2 })).toBeInTheDocument();
    });
    expect(screen.getAllByText(result.reading.todayMessage).length).toBeGreaterThan(0);
    expect(
      JSON.parse(window.localStorage.getItem(getDailyTarotStorageKey(dateKey)) ?? "{}"),
    ).toMatchObject({
      date: dateKey,
      source: "curated",
    });
  });

  it("restores the stored card for the same day on reload", async () => {
    const dateKey = getLocalDateKey();
    const result = createResult(dateKey);

    window.localStorage.setItem(getDailyTarotStorageKey(dateKey), JSON.stringify(result));

    const { unmount } = renderRoute();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: result.card.name, level: 2 })).toBeInTheDocument();
    });
    expect(screen.getAllByText(result.reading.todayMessage).length).toBeGreaterThan(0);

    unmount();
    renderRoute();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: result.card.name, level: 2 })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "Draw today’s card" })).not.toBeInTheDocument();
  });

  it("unlocks a fresh draw when the local day changes", async () => {
    const firstDateKey = getLocalDateKey();
    const result = createResult(firstDateKey);

    window.localStorage.setItem(getDailyTarotStorageKey(firstDateKey), JSON.stringify(result));

    renderRoute();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: result.card.name, level: 2 })).toBeInTheDocument();
    });

    act(() => {
      vi.setSystemTime(new Date("2026-05-23T12:01:00.000"));
      vi.advanceTimersByTime(60_000);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Draw today’s card" })).toBeInTheDocument();
    });
  });
});
