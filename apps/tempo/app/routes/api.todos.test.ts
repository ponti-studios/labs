import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

function makeChain() {
  return {
    from: vi.fn(),
    where: vi.fn(),
    innerJoin: vi.fn(),
    orderBy: vi.fn(),
    returning: vi.fn(),
    values: vi.fn(),
    set: vi.fn(),
  };
}

vi.mock("@pontistudios/db", () => ({
  db: mockDb,
  eq: vi.fn((a, b) => ({ type: "eq", a, b })),
  and: vi.fn((...args) => ({ type: "and", args })),
  desc: vi.fn((value) => ({ desc: value })),
  inArray: vi.fn((column, values) => ({ type: "inArray", column, values })),
  todos: {
    id: "id",
    userId: "user_id",
    title: "title",
    start: "start",
    end: "end",
    completed: "completed",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  tags: {
    id: "id",
    userId: "user_id",
    name: "name",
    normalizedName: "normalized_name",
    color: "color",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  todoTags: {
    todoId: "todo_id",
    tagId: "tag_id",
    createdAt: "created_at",
  },
}));

const makeRequest = (method: string, body?: unknown, url = "http://localhost/api/todos"): Request =>
  new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

describe("api.todos loader", () => {
  beforeEach(() => {
    const todoChain = makeChain();
    todoChain.from.mockReturnValue(todoChain);
    todoChain.where.mockReturnValue(todoChain);
    todoChain.orderBy.mockResolvedValue([
      {
        id: 1,
        userId: "demo-user",
        title: "Test todo",
        start: "2024-01-01",
        end: "2024-01-02",
        completed: 0,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);

    const tagChain = makeChain();
    tagChain.from.mockReturnValue(tagChain);
    tagChain.innerJoin.mockReturnValue(tagChain);
    tagChain.where.mockResolvedValue([
      {
        todoId: 1,
        id: 3,
        userId: "demo-user",
        name: "writing",
        normalizedName: "writing",
        color: "#64748b",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);

    mockDb.select.mockReturnValueOnce(todoChain).mockReturnValueOnce(tagChain);
  });

  afterEach(() => vi.clearAllMocks());

  it("returns todos with tags", async () => {
    const { loader } = await import("./api.todos");
    const response = await loader();
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data[0].title).toBe("Test todo");
    expect(data[0].completed).toBe(false);
    expect(data[0].tags).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "writing" })]),
    );
  });
});

describe("api.todos action", () => {
  afterEach(() => vi.clearAllMocks());

  it("POST reuses an existing tag when the normalized value already exists", async () => {
    const existingTagSelectChain = makeChain();
    existingTagSelectChain.from.mockReturnValue(existingTagSelectChain);
    existingTagSelectChain.where.mockResolvedValue([
      {
        id: 4,
        userId: "demo-user",
        name: "writing",
        normalizedName: "writing",
        color: "#64748b",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);

    mockDb.select.mockReturnValueOnce(existingTagSelectChain);

    const todoInsertChain = makeChain();
    todoInsertChain.values.mockReturnValue(todoInsertChain);
    todoInsertChain.returning.mockResolvedValue([
      {
        id: 1,
        userId: "demo-user",
        title: "Write draft",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: 0,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);

    const todoTagInsertChain = makeChain();
    todoTagInsertChain.values.mockResolvedValue([]);

    mockDb.insert.mockReturnValueOnce(todoInsertChain).mockReturnValueOnce(todoTagInsertChain);

    const deleteChain = makeChain();
    deleteChain.where.mockResolvedValue([]);
    mockDb.delete.mockReturnValue(deleteChain);

    const { action } = await import("./api.todos");
    const response = await action({
      request: makeRequest("POST", {
        title: "Write draft",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: false,
        tags: ["Writing"],
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tags).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "writing" })]),
    );
  });

  it("POST creates a new tag with the default color when none exists", async () => {
    const emptyTagSelectChain = makeChain();
    emptyTagSelectChain.from.mockReturnValue(emptyTagSelectChain);
    emptyTagSelectChain.where.mockResolvedValue([]);
    mockDb.select.mockReturnValueOnce(emptyTagSelectChain);

    const tagInsertChain = makeChain();
    tagInsertChain.values.mockReturnValue(tagInsertChain);
    tagInsertChain.returning.mockResolvedValue([
      {
        id: 8,
        userId: "demo-user",
        name: "deep-work",
        normalizedName: "deep-work",
        color: "#64748b",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);

    const todoInsertChain = makeChain();
    todoInsertChain.values.mockReturnValue(todoInsertChain);
    todoInsertChain.returning.mockResolvedValue([
      {
        id: 2,
        userId: "demo-user",
        title: "Focus block",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: 0,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);

    const todoTagInsertChain = makeChain();
    todoTagInsertChain.values.mockResolvedValue([]);

    mockDb.insert
      .mockReturnValueOnce(tagInsertChain)
      .mockReturnValueOnce(todoInsertChain)
      .mockReturnValueOnce(todoTagInsertChain);

    const deleteChain = makeChain();
    deleteChain.where.mockResolvedValue([]);
    mockDb.delete.mockReturnValue(deleteChain);

    const { action } = await import("./api.todos");
    const response = await action({
      request: makeRequest("POST", {
        title: "Focus block",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: false,
        tags: ["Deep Work"],
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tags).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "deep-work", color: "#64748b" })]),
    );
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
