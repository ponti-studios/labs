import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { verifySession } from "./index";
import { createServer } from "../../server";
import { User } from "@prisma/client";

describe("verifySession", () => {
  let request: FastifyRequest;
  let reply: FastifyReply;
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await createServer({ logger: false });
    request = {} as FastifyRequest;
    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
      log: {
        error: jest.fn(),
      },
    } as any as FastifyReply;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 if no session exists and JWT token cannot be verified", async () => {
    request.session = {
      get: jest.fn().mockReturnValue(undefined),
    } as any;
    request.jwtVerify = jest.fn().mockRejectedValue(new Error("Invalid token"));

    await verifySession.bind(server)(request, reply, jest.fn());

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
      get: jest.fn().mockReturnValue(undefined),
    } as any;
    request.jwtVerify = jest.fn().mockResolvedValue({});

    await verifySession.bind(server)(request, reply, jest.fn());

    expect(request.session.get).toHaveBeenCalledWith("data");
    expect(request.jwtVerify).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalled();
  });

  test("should return 401 if user does not exist", async () => {
    request.session = {
      get: jest.fn().mockReturnValue(undefined),
      set: jest.fn(),
    } as any;
    request.jwtVerify = jest.fn().mockResolvedValue({ userId: "123" });
    jest.spyOn(server.prisma.user, "findUnique").mockResolvedValue(null);

    await verifySession.bind(server)(request, reply, jest.fn());

    expect(request.session.get).toHaveBeenCalledWith("data");
    expect(request.jwtVerify).toHaveBeenCalled();
    expect(server.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "123" },
    });
    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalled();
  });

  test("should set session data if session exists but email is missing", async () => {
    const user = { email: "test@example.com" };
    request.session = {
      get: jest.fn().mockReturnValue({ userId: "123" }),
      set: jest.fn(),
    } as any;
    jest
      .spyOn(server.prisma.user, "findUnique")
      .mockResolvedValue(user as User);

    await verifySession.bind(server)(request, reply, jest.fn());

    expect(request.session.get).toHaveBeenCalledWith("data");
    expect(server.prisma.user.findUnique).toHaveBeenCalledWith({
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
      get: jest
        .fn()
        .mockReturnValue({ userId: "123", email: "test@example.com" }),
      set: jest.fn(),
    } as any;
    jest
      .spyOn(server.prisma.user, "findUnique")
      .mockResolvedValue(user as User);

    await verifySession.bind(server)(request, reply, jest.fn());

    expect(request.session.get).toHaveBeenCalledWith("data");
    expect(server.prisma.user.findUnique).not.toHaveBeenCalled();
    expect(request.session.set).not.toHaveBeenCalled();
  });
});
