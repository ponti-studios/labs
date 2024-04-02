import { vi } from "vitest";

// Allow router mocks.
vi.mock("next/router", () => require("next-router-mock"));
