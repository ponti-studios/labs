import { beforeEach, describe, expect, it, vi } from "vitest";
import * as googleMaps from "./google-maps";

// Mock @googlemaps/js-api-loader
vi.mock("@googlemaps/js-api-loader", () => ({
  setOptions: vi.fn(),
  importLibrary: vi.fn(() => Promise.resolve()),
}));

// Mock google.maps global
globalThis.google = {
  maps: {
    Geocoder: vi.fn(() => ({
      geocode: vi.fn(),
    })),
    DirectionsService: vi.fn(() => ({
      route: vi.fn(),
    })),
    TravelMode: { DRIVING: "DRIVING" } as any,
  } as any,
} as any;

describe("cleanHtmlFromInstructions", () => {
  it("removes HTML tags and decodes entities", () => {
    const html = "<b>Turn &lt;left&gt; at Main St &amp; 1st Ave</b>";
    const result = googleMaps.cleanHtmlFromInstructions(html);
    expect(result).toBe("Turn <left> at Main St & 1st Ave");
  });

  it("handles empty string", () => {
    expect(googleMaps.cleanHtmlFromInstructions("")).toBe("");
  });
});

describe("geocodeLocation", () => {
  const apiKey = "test-api-key";

  beforeEach(() => {
    (google.maps.Geocoder as any).mockImplementation(() => ({
      geocode: (opts: any, cb: any) => {
        if (opts.address === "valid") {
          cb(
            [
              {
                geometry: { location: { lat: () => 1, lng: () => 2 } },
                formatted_address: "Test Address",
              },
            ],
            "OK",
          );
        } else {
          cb(null, "ZERO_RESULTS");
        }
      },
    }));
  });

  it("returns locations for valid address", async () => {
    const result = await googleMaps.geocodeLocation("valid", apiKey);
    expect(result).toEqual([{ lat: 1, lng: 2, address: "Test Address" }]);
  });

  it("throws for invalid address", async () => {
    await expect(googleMaps.geocodeLocation("invalid", apiKey)).rejects.toThrow(
      "Geocoding failed: ZERO_RESULTS",
    );
  });
});

describe("getDirections", () => {
  const apiKey = "test-api-key";

  beforeEach(() => {
    (google.maps.DirectionsService as any).mockImplementation(() => ({
      route: (opts: any, cb: any) => {
        if (opts.origin === "A" && opts.destination === "B") {
          cb(
            {
              routes: [
                {
                  legs: [
                    {
                      start_address: "A",
                      end_address: "B",
                      distance: { text: "10 mi" },
                      duration: { text: "20 mins" },
                      steps: [
                        {
                          instructions: "<b>Head north</b>",
                          distance: { text: "5 mi" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            "OK",
          );
        } else {
          cb(null, "NOT_FOUND");
        }
      },
    }));
  });

  it("returns directions for valid route", async () => {
    const result = await googleMaps.getDirections("A", "B", apiKey);
    expect(result).toEqual({
      summary: {
        from: "A",
        to: "B",
        distance: "10 mi",
        duration: "20 mins",
      },
      steps: [{ instruction: "Head north", distance: "5 mi" }],
    });
  });

  it("throws for invalid route", async () => {
    await expect(googleMaps.getDirections("X", "Y", apiKey)).rejects.toThrow(
      "Directions failed: NOT_FOUND",
    );
  });
});
