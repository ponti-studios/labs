import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockChain = {
  from: vi.fn(),
  where: vi.fn(),
  leftJoin: vi.fn(),
  returning: vi.fn(),
  values: vi.fn(),
  set: vi.fn(),
};

// Wire the chain so each call returns itself (fluent interface)
for (const key of Object.keys(mockChain) as (keyof typeof mockChain)[]) {
  mockChain[key].mockReturnValue(mockChain);
}

vi.mock("@pontistudios/db", () => ({
  db: mockDb,
  eq: vi.fn((a, b) => ({ type: "eq", a, b })),
  and: vi.fn((...args) => ({ type: "and", args })),
  todos: { id: "id", userId: "user_id", projectId: "project_id", title: "title", start: "start", end: "end", completed: "completed", createdAt: "created_at", updatedAt: "updated_at" },
  projects: { id: "id", userId: "user_id", name: "name" },
}));

const makeRequest = (method: string, body?: unknown, url = "http://localhost/api/todos"): Request =>
  new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

describe("api.todos loader", () => {
  beforeEach(() => {
    mockDb.select.mockReturnValue(mockChain);
    mockChain.from.mockReturnValue(mockChain);
    mockChain.leftJoin.mockReturnValue(mockChain);
    mockChain.where.mockResolvedValue([
      {
        id: 1,
        userId: "demo-user",
        projectId: 1,
        title: "Test todo",
        start: "2024-01-01",
        end: "2024-01-02",
        completed: 0,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        projectName: "Test Project",
      },
    ]);
  });

  afterEach(() => vi.clearAllMocks());

  it("returns todos with project names", async () => {
    const { loader } = await import("./api.todos");
    const response = await loader();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data[0].title).toBe("Test todo");
    expect(data[0].completed).toBe(false);
    expect(data[0].projectName).toBe("Test Project");
  });
});

describe("api.todos action", () => {
  afterEach(() => vi.clearAllMocks());

  it("POST validates projectId ownership before creating", async () => {
    // Project lookup returns empty (not found / wrong user)
    mockDb.select.mockReturnValue(mockChain);
    mockChain.from.mockReturnValue(mockChain);
    mockChain.where.mockResolvedValue([]);

    const { action } = await import("./api.todos");
    const req = makeRequest("POST", {
      projectId: 999,
      title: "Test",
      start: "2024-01-01",
      end: "2024-01-02",
      completed: false,
    });

    const response = await action({ request: req });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Project not found/);
  });

  it("POST creates todo when projectId is null", async () => {
    const newTodo = {
      id: 1,
      userId: "demo-user",
      projectId: null,
      title: "No-project task",
      start: "2024-01-01",
      end: "2024-01-02",
      completed: 0,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
    mockDb.insert.mockReturnValue(mockChain);
    mockChain.values.mockReturnValue(mockChain);
    mockChain.returning.mockResolvedValue([newTodo]);

    const { action } = await import("./api.todos");
    const req = makeRequest("POST", {
      projectId: null,
      title: "No-project task",
      start: "2024-01-01",
      end: "2024-01-02",
      completed: false,
    });

    const response = await action({ request: req });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.title).toBe("No-project task");
    expect(body.projectId).toBeNull();
  });

  it("DELETE returns 400 when id is missing", async () => {
    const { action } = await import("./api.todos");
    const req = makeRequest("DELETE", undefined, "http://localhost/api/todos");
    const response = await action({ request: req });
    expect(response.status).toBe(400);
  });

  it("returns 405 for unsupported methods", async () => {
    const { action } = await import("./api.todos");
    const req = makeRequest("PATCH");
    const response = await action({ request: req });
    expect(response.status).toBe(405);
  });
});
