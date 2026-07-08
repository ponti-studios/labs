import { describe, expect, it } from "vitest";

import { loader } from "./api.medication-schedule";

describe("medication schedule loader", () => {
  it("returns the expected weekly dosing schedule", async () => {
    const response = await loader({
      request: new Request("http://localhost/api/medication-schedule"),
      params: {},
      context: {},
    } as never);

    expect(response).toEqual({
      weeklyDosages: [25, 30, 20, 35],
      penCapacity: 100,
      description: "Weekly medication dosages in mg",
    });
  });
});
