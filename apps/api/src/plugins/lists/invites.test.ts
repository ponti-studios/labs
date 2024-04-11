import { prisma } from "@hominem/db";
import type { FastifyInstance } from "fastify";
import type { Mock } from "vitest";
import { vi } from "vitest";

import { createServer } from "@app/server";
import { mockAuthSession } from "@test/utils";

describe("GET /lists/:id/invites", () => {
	let server: FastifyInstance;

	beforeAll(async () => {
		server = await createServer({ logger: false });
		vi.spyOn(prisma.list, "findMany").mockResolvedValue([]);
	});

	afterEach(async () => {
		vi.resetAllMocks();
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await server.close();
	});

	test("returns 200", async () => {
		const mockResponse = [
			{
				accepted: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				listId: "123",
				invitedUserEmail: "test@email.com",
				invitedUserId: "12345",
			},
		];
		mockAuthSession();
		(prisma.listInvite.findMany as Mock).mockResolvedValueOnce(mockResponse);
		const response = await server.inject({
			method: "GET",
			url: "/lists/123/invites",
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual(mockResponse);
	});
});
