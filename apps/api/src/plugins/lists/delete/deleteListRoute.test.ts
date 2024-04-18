import { createServer } from "@app/server";
import { prisma } from "@hominem/db";
import { mockAuthSession } from "@test/utils";
import type { FastifyInstance } from "fastify";
import type { Mock } from "vitest";
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";

describe("DELETE /lists/:id", () => {
	let server: FastifyInstance;

	beforeEach(async () => {
		server = await createServer();
	});

	afterEach(async () => {
		vi.resetAllMocks();
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await server.close();
	});

	test("should delete a list", async () => {
		mockAuthSession();
		const payload = {
			id: "testListId",
			name: "My List",
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		(prisma.list.delete as Mock).mockResolvedValue(payload);
		const response = await server.inject({
			method: "DELETE",
			url: "/lists/testListId",
		});
		expect(prisma.list.delete).toHaveBeenCalledWith({
			where: { id: "testListId" },
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toHaveProperty("list");
		expect(response.json().list).toHaveProperty("id");
		expect(response.json().list).toHaveProperty("name");
		expect(response.json().list).toHaveProperty("createdAt");
		expect(response.json().list).toHaveProperty("updatedAt");
	});
});
