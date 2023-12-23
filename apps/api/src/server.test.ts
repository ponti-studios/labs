import { createServer } from "./server";

describe("server", () => {
  let server: any;

  beforeAll(async () => {
    server = await createServer({ logger: false });
  });

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
