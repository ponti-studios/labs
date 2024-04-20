import dotenv from "dotenv";
dotenv.config();

import { vi } from "vitest";
import * as auth from "../src/plugins/auth/utils";

function mockPrismaModel() {
	return {
		create: vi.fn(),
		createMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		findFirst: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
	};
}

vi.mock("sendgrid", () => ({
	setApiKey: vi.fn(),
	send: vi.fn(),
}));

vi.mock("@hominem/db", () => ({
	prisma: Object.assign(
		{
			$connect: vi.fn(),
			$disconnect: vi.fn(),
		},
		["list", "listInvite", "userLists", "place", "user", "item"].reduce(
			(acc, model) => Object.assign(acc, { [model]: mockPrismaModel() }),
			{},
		),
	),
}));

vi.mock("../src/analytics", () => ({
	track: vi.fn(),
	EVENTS: {
		USER_EVENTS: {},
	},
}));

vi.mock("googleapis", () => ({
	google: {
		auth: {
			GoogleAuth: vi.fn(),
		},
		options: vi.fn(),
		places: vi.fn(() => ({
			places: {
				get: vi.fn(),
				photos: {
					getMedia: vi.fn(),
				},
				searchText: vi.fn(),
			},
		})),
	},
}));

vi.spyOn(auth, "verifySession");
