import { prisma } from "@hominem/db";
import type { FastifyInstance } from "fastify";
import type { Mock } from "vitest";
import { vi } from "vitest";

import { createServer } from "@app/server";
import { mockAuthSession } from "@test/utils";

describe("GET /invites", () => {
	let server: FastifyInstance;

	beforeAll(async () => {
		server = await createServer();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should return users' incoming invites", async () => {
		mockAuthSession();
		(prisma.listInvite.findMany as Mock).mockResolvedValueOnce([]);
		(prisma.user.findUnique as Mock).mockResolvedValueOnce({
			email: "testUser@email.com",
		});
		const response = await server.inject({
			method: "GET",
			url: "/invites",
		});

		expect(prisma.listInvite.findMany).toHaveBeenCalledWith({
			where: {
				OR: [
					{ invitedUserId: "testUserId" },
					{ invitedUserEmail: "testUser@email.com" },
				],
			},
			include: {
				list: {
					select: {
						id: true,
						name: true,
					},
				},
				user: {
					select: {
						email: true,
						name: true,
					},
				},
			},
			orderBy: { listId: "asc" },
		});
		expect(response.statusCode).toEqual(200);
		expect(response.json()).toEqual([]);
	});

	it("should return users' outgoing invites", async () => {
		mockAuthSession();
		(prisma.listInvite.findMany as Mock).mockResolvedValueOnce([]);
		const response = await server.inject({
			method: "GET",
			url: "/invites/outgoing",
		});

		expect(prisma.listInvite.findMany).toHaveBeenCalledWith({
			where: { userId: "testUserId" },
		});
		expect(response.statusCode).toEqual(200);
		expect(response.json()).toEqual([]);
	});
});
