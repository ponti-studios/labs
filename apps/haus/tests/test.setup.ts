import { server } from "@/tests/test.server";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import mediaQuery from "css-mediaquery";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import "whatwg-fetch";
import {
	DESKTOP_RESOLUTION_HEIGHT,
	DESKTOP_RESOLUTION_WIDTH,
} from "./test.utils";

// Allow router mocks.
vi.mock("next/navigation", () => require("next-router-mock"));

beforeAll(() => {
	server.use();
	// Change to warn temporarily for debugging
	server.listen({ onUnhandledRequest: "warn" });
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: (query: string) => {
			function matchQuery(): boolean {
				return mediaQuery.match(query, {
					width: window.innerWidth,
					height: window.innerHeight,
				});
			}

			const listeners: (() => void)[] = [];
			const instance = {
				matches: matchQuery(),
				addEventListener: (_: "change", listener: () => void): void => {
					listeners.push(listener);
				},
				removeEventListener: (_: "change", listener: () => void): void => {
					const index = listeners.indexOf(listener);
					if (index >= 0) {
						listeners.splice(index, 1);
					}
				},
			};
			window.addEventListener("resize", () => {
				const change = matchQuery();
				if (change !== instance.matches) {
					instance.matches = change;
					for (const listener of listeners) listener();
				}
			});

			return instance;
		},
	});
	Object.defineProperty(window, "scrollTo", {
		writable: true,
		value: () => {},
	});
	Object.defineProperty(window, "resizeTo", {
		writable: true,
		value: (width: number, height: number) => {
			Object.assign(window, {
				innerWidth: width,
				innerHeight: height,
			}).dispatchEvent(new window.Event("resize"));
		},
	});
});

beforeEach(() => {
	window.resizeTo(DESKTOP_RESOLUTION_WIDTH, DESKTOP_RESOLUTION_HEIGHT);
});

afterAll(() => server.close());

afterEach(() => {
	server.resetHandlers();
	cleanup();
});
