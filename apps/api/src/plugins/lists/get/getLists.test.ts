import { prisma } from "@hominem/db";
import { FastifyInstance } from "fastify";

import { mockAuthSession } from "../../../../test/utils";
import { createServer } from "../../../server";

describe("GET /lists/:id", () => {
  let server: FastifyInstance;
  // let prisma: PrismaClient;

  beforeAll(async () => {
    server = await createServer({ logger: false });
  });

  afterEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await server.close();
  });

  test("returns 200", async () => {
    const userList = {
      list: {
        accepted: false,
        listId: "123",
        invitedUserEmail: "test@email.com",
        createdBy: {
          email: "test@email.com",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    const list = {
      id: "123",
      name: "test list",
      createdBy: {
        email: "test@email.com",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAuthSession();
    (prisma.list.findMany as jest.Mock).mockResolvedValueOnce([list]);
    (prisma.userLists.findMany as jest.Mock).mockResolvedValueOnce([userList]);
    const response = await server.inject({
      method: "GET",
      url: `/lists`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([list, userList.list]);
  });
});
