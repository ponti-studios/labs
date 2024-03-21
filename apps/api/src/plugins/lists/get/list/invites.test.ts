import { prisma } from "@hominem/db";
import { FastifyInstance } from "fastify";

import { mockAuthSession } from "../../../../test.utils";
import { createServer } from "../../../../server";

describe("GET /lists/:id/invites", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createServer({ logger: false });
    jest.spyOn(prisma.list, "findMany").mockResolvedValue([]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();
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
    (prisma.listInvite.findMany as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );
    const response = await server.inject({
      method: "GET",
      url: `/lists/123/invites`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockResponse);
  });
});
