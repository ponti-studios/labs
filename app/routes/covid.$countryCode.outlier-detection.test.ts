import { describe, expect, it } from "vitest";

import { buildOutlierDetectionUrl, loader } from "./covid.$countryCode.outlier-detection";

describe("COVID outlier detection route", () => {
  it("builds an absolute API URL for server-side data fetching", () => {
    expect(
      buildOutlierDetectionUrl("https://labs.ponti.io", "OWID_WRL", "new_cases_smoothed").href,
    ).toBe(
      "https://labs.ponti.io/api/covid/analytics/outlier-detection?country=OWID_WRL&metric=new_cases_smoothed",
    );
  });

  it("passes the request origin to the rendered route", async () => {
    await expect(
      loader({
        params: { countryCode: "OWID_WRL" },
        url: new URL("https://labs.ponti.io/covid/OWID_WRL/outlier-detection"),
        pattern: "/covid/:countryCode/outlier-detection",
        context: {} as Parameters<typeof loader>[0]["context"],
        request: new Request("https://labs.ponti.io/covid/OWID_WRL/outlier-detection"),
      }),
    ).resolves.toEqual({ countryCode: "OWID_WRL", origin: "https://labs.ponti.io" });
  });
});
