import { createServer } from "@app/server";
import { type User, prisma } from "@hominem/db";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { vi } from "vitest";

import { verifySession } from "./index";

describe("verifySession", () => {
	let request: FastifyRequest;
	let reply: FastifyReply;
	let server: FastifyInstance;

	beforeEach(async () => {
		server = await createServer({ logger: false });
		request = {} as FastifyRequest;
		reply = {
			code: vi.fn().mockReturnThis(),
			send: vi.fn(),
			log: {
				error: vi.fn(),
			},
		} as any as FastifyReply;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	test("should return 401 if no session exists and JWT token cannot be verified", async () => {
		request.session = {
			get: vi.fn().mockReturnValue(undefined),
		} as any;
		request.jwtVerify = vi.fn().mockRejectedValue(new Error("Invalid token"));

		await verifySession.bind(server)(request, reply, vi.fn());

		expect(request.session.get).toHaveBeenCalledWith("data");
		expect(request.jwtVerify).toHaveBeenCalled();
		expect(reply.log.error).toHaveBeenCalledWith(
			"Could not verify session token",
			expect.any(Error),
		);
		expect(reply.code).toHaveBeenCalledWith(401);
		expect(reply.send).toHaveBeenCalled();
	});

	test("should return 401 if JWT token is invalid or does not contain userId", async () => {
		request.session = {
			get: vi.fn().mockReturnValue(undefined),
		} as any;
		request.jwtVerify = vi.fn().mockResolvedValue({});

		await verifySession.bind(server)(request, reply, vi.fn());

		expect(request.session.get).toHaveBeenCalledWith("data");
		expect(request.jwtVerify).toHaveBeenCalled();
		expect(reply.code).toHaveBeenCalledWith(401);
		expect(reply.send).toHaveBeenCalled();
	});

	test("should return 401 if user does not exist", async () => {
		request.session = {
			get: vi.fn().mockReturnValue(undefined),
			set: vi.fn(),
		} as any;
		request.jwtVerify = vi.fn().mockResolvedValue({ userId: "123" });
		vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

		await verifySession.bind(server)(request, reply, vi.fn());

		expect(request.session.get).toHaveBeenCalledWith("data");
		expect(request.jwtVerify).toHaveBeenCalled();
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: "123" },
		});
		expect(reply.code).toHaveBeenCalledWith(401);
		expect(reply.send).toHaveBeenCalled();
	});

	test("should set session data if session exists but email is missing", async () => {
		const user = { email: "test@example.com" };
		request.session = {
			get: vi.fn().mockReturnValue({ userId: "123" }),
			set: vi.fn(),
		} as any;
		vi.spyOn(prisma.user, "findUnique").mockResolvedValue(user as User);

		await verifySession.bind(server)(request, reply, vi.fn());

		expect(request.session.get).toHaveBeenCalledWith("data");
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: "123" },
		});
		expect(request.session.set).toHaveBeenCalledWith("data", {
			userId: "123",
			email: "test@example.com",
		});
	});

	test("should not modify session data if session exists and email is present", async () => {
		const user = { email: "test@example.com" };
		request.session = {
			get: vi
				.fn()
				.mockReturnValue({ userId: "123", email: "test@example.com" }),
			set: vi.fn(),
		} as any;
		vi.spyOn(prisma.user, "findUnique").mockResolvedValue(user as User);

		await verifySession.bind(server)(request, reply, vi.fn());

		expect(request.session.get).toHaveBeenCalledWith("data");
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
		expect(request.session.set).not.toHaveBeenCalled();
	});
});
