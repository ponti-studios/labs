import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Build a fresh fluent chain per test to avoid cross-test mock state bleed
function makeChain(terminalValue?: unknown) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ["from", "where", "leftJoin", "returning", "values", "set", "orderBy"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  // The last method in the chain resolves with the provided value
  if (terminalValue !== undefined) {
    // Will be overridden per test
  }
  return chain;
}

vi.mock("@pontistudios/db", () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    eq: vi.fn((a, b) => ({ type: "eq", a, b })),
    and: vi.fn((...args) => ({ type: "and", args })),
    count: vi.fn(() => "count(*)"),
    desc: vi.fn((a) => ({ desc: a })),
    projects: {
      id: "id",
      userId: "user_id",
      name: "name",
      description: "description",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    todos: { id: "id", userId: "user_id", projectId: "project_id" },
  };
});

const makeRequest = (
  method: string,
  body?: unknown,
  url = "http://localhost/api/projects",
): Request =>
  new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

describe("api.projects loader", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns projects with task counts", async () => {
    const { db } = await import("@pontistudios/db");

    // First select chain: fetch projects list (resolves via orderBy)
    const projectChain = makeChain();
    projectChain.orderBy.mockResolvedValue([
      {
        id: 1,
        userId: "demo-user",
        name: "Project A",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Second select chain: count todos for project 1 (resolves via where)
    const countChain = makeChain();
    countChain.where.mockResolvedValue([{ value: 3 }]);

    (db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(projectChain)
      .mockReturnValueOnce(countChain);

    const { loader } = await import("./api.projects");
    const response = await loader();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe("Project A");
    expect(data[0].taskCount).toBe(3);
  });
});

describe("api.projects action", () => {
  afterEach(() => vi.clearAllMocks());

  it("POST creates a project and returns taskCount: 0", async () => {
    const { db } = await import("@pontistudios/db");

    const insertChain = makeChain();
    insertChain.returning.mockResolvedValue([
      {
        id: 1,
        userId: "demo-user",
        name: "New Project",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);

    const { action } = await import("./api.projects");
    const req = makeRequest("POST", { name: "New Project", description: null });
    const response = await action({ request: req });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("New Project");
    expect(body.taskCount).toBe(0);
  });

  it("DELETE returns 400 when id is missing", async () => {
    const { action } = await import("./api.projects");
    const req = makeRequest("DELETE", undefined, "http://localhost/api/projects");
    const response = await action({ request: req });
    expect(response.status).toBe(400);
  });

  it("DELETE returns 404 when project not found", async () => {
    const { db } = await import("@pontistudios/db");

    const deleteChain = makeChain();
    deleteChain.returning.mockResolvedValue([]);
    (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(deleteChain);

    const { action } = await import("./api.projects");
    const req = makeRequest("DELETE", undefined, "http://localhost/api/projects?id=999");
    const response = await action({ request: req });
    expect(response.status).toBe(404);
  });

  it("returns 405 for unsupported methods", async () => {
    const { action } = await import("./api.projects");
    const req = makeRequest("PATCH");
    const response = await action({ request: req });
    expect(response.status).toBe(405);
  });
});
