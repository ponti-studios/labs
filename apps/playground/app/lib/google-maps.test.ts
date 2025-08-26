import { beforeEach, describe, expect, it, vi } from "vitest";
import * as googleMaps from "./google-maps";

// Mock window.google for geocodeLocation and getDirections
globalThis.window = Object.create(window);

class MockDirectionsRenderer {
	getDirections(): any {
		return null;
	}
	getMap(): any {
		return null;
	}
	getPanel(): any {
		return null;
	}
	getRouteIndex(): any {
		return null;
	}
	setDirections(): void {}
	setMap(): void {}
	setOptions(): void {}
	setPanel(): void {}
	setRouteIndex(): void {}
	addListener(): any {
		return { remove: () => {} };
	}
	bindTo(): void {}
	get(): void {}
	notify(): void {}
	set(): void {}
	unbind(): void {}
	unbindAll(): void {}
	setValues(): void {}
}

class MockLatLngBounds {
	static MAX_BOUNDS: MockLatLngBounds;
	contains(): boolean {
		return false;
	}
	equals(): boolean {
		return false;
	}
	extend(): this {
		return this;
	}
	getCenter(): any {
		return {};
	}
	getNorthEast(): any {
		return {};
	}
	getSouthWest(): any {
		return {};
	}
	intersects(): boolean {
		return false;
	}
	isEmpty(): boolean {
		return false;
	}
	toJSON(): any {
		return {};
	}
	toSpan(): any {
		return {};
	}
	toString(): string {
		return "";
	}
	toUrlValue(): string {
		return "";
	}
	union(): this {
		return this;
	}
}
MockLatLngBounds.MAX_BOUNDS = new MockLatLngBounds();
window.google = {
	maps: {
		Geocoder: vi.fn(() => ({
			geocode: vi.fn(),
		})),
		DirectionsService: vi.fn(() => ({
			route: vi.fn(),
		})),
		DirectionsRenderer: MockDirectionsRenderer,
		LatLngBounds: MockLatLngBounds,
		TravelMode: { DRIVING: "DRIVING" } as any,
	} as any,
};

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
	beforeEach(() => {
		(window.google.maps.Geocoder as any).mockImplementation(() => ({
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
		const result = await googleMaps.geocodeLocation("valid");
		expect(result).toEqual([{ lat: 1, lng: 2, address: "Test Address" }]);
	});

	it("throws for invalid address", async () => {
		await expect(googleMaps.geocodeLocation("invalid")).rejects.toThrow(
			"Geocoding failed: ZERO_RESULTS",
		);
	});
});

describe("getDirections", () => {
	beforeEach(() => {
		(window.google.maps.DirectionsService as any).mockImplementation(() => ({
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
		const result = await googleMaps.getDirections("A", "B");
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
		await expect(googleMaps.getDirections("X", "Y")).rejects.toThrow(
			"Directions failed: NOT_FOUND",
		);
	});
});
