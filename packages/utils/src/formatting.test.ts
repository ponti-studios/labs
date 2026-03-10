import { describe, it, expect, vi } from "vitest";
import {
  formatDate,
  formatCurrency,
  truncate,
  generateId,
  deepMerge,
  debounce,
  throttle,
} from "./formatting";

describe("formatDate", () => {
  it("should format date string", () => {
    const result = formatDate("2024-01-15T12:00:00Z");
    expect(result).toContain("Jan");
    expect(result).toContain("2024");
    // Check for day (may vary by timezone, so just check it's a valid format)
    expect(result).toMatch(/\d{1,2}/);
  });

  it("should format Date object", () => {
    const result = formatDate(new Date(2024, 0, 15));
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("should accept custom options", () => {
    const result = formatDate("2024-01-15", { month: "long" });
    expect(result).toContain("January");
  });
});

describe("formatCurrency", () => {
  it("should format USD by default", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("should format other currencies", () => {
    expect(formatCurrency(100, "EUR")).toContain("100");
    expect(formatCurrency(100, "EUR")).toContain("€");
  });
});

describe("truncate", () => {
  it("should not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("should truncate long strings", () => {
    expect(truncate("hello world this is long", 10)).toBe("hello worl...");
  });

  it("should handle exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("generateId", () => {
  it("should generate a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("should generate unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("should generate non-empty IDs", () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
});

describe("deepMerge", () => {
  it("should merge simple objects", () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should deep merge nested objects", () => {
    const result = deepMerge({ a: { b: 1 } }, { a: { c: 2 } });
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  it("should override primitive values", () => {
    const result = deepMerge({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it("should not merge arrays", () => {
    const result = deepMerge({ a: [1] }, { a: [2] });
    expect(result).toEqual({ a: [2] });
  });
});

describe("debounce", () => {
  it("should delay function execution", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("should reset timer on multiple calls", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

describe("throttle", () => {
  it("should limit function execution", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
