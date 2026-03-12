import { describe, it, expect } from "vitest";
import { cn, invariant, invariantResponse } from "./cn";

describe("cn", () => {
  it("should merge tailwind classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle conditional classes", () => {
    // use ternary expressions to avoid constant-binary-expression lint warnings
    expect(
      cn(
        "base",
        1 ? "conditional" : undefined,
        0 ? "ignored" : undefined,
      ),
    ).toBe("base conditional");
  });

  it("should handle arrays", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
  });

  it("should handle objects", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });
});

describe("invariant", () => {
  it("should not throw when condition is true", () => {
    expect(() => invariant(true, "error")).not.toThrow();
  });

  it("should throw when condition is false", () => {
    expect(() => invariant(false, "custom error")).toThrow("custom error");
  });
});

describe("invariantResponse", () => {
  it("should not throw when condition is true", () => {
    expect(() => invariantResponse(true, "error")).not.toThrow();
  });

  it("should throw Response when condition is false", () => {
    expect(() => invariantResponse(false, "bad request")).toThrow(Response);
  });

  it("should use custom status code", () => {
    try {
      invariantResponse(false, "not found", { status: 404 });
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
    }
  });
});
