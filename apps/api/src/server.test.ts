import { createServer } from "./server";

describe("api endpoints", () => {
  const server = createServer({ logger: false });

  afterAll(async () => {
    await server.close();
  });

  test("status endpoint returns 200", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/status",
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ up: true });
  });
});
