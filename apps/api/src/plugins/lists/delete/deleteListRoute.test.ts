// Test for deleteListRoute
import { prisma } from "@hominem/db";
import { FastifyInstance } from "fastify";
import { createServer } from "../../../server";
import { mockAuthSession } from "../../../../test/utils";

describe("DELETE /lists/:id", () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await server.close();
  });

  it("should delete a list", async () => {
    mockAuthSession();
    const payload = {
      id: "testListId",
      name: "My List",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.list.delete as jest.Mock).mockResolvedValue(payload);
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
