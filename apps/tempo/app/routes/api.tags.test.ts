import { afterEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  select: vi.fn(),
};

function makeChain() {
  return {
    from: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
  };
}

vi.mock("@pontistudios/db", () => ({
  asc: vi.fn((value) => ({ asc: value })),
  db: mockDb,
  eq: vi.fn((a, b) => ({ type: "eq", a, b })),
  tags: {
    id: "id",
    userId: "user_id",
    name: "name",
    normalizedName: "normalized_name",
    color: "color",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}));

describe("api.tags loader", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns user tags ordered by name", async () => {
    const chain = makeChain();
    chain.from.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    chain.orderBy.mockResolvedValue([
      {
        id: 1,
        userId: "demo-user",
        name: "deep-work",
        normalizedName: "deep-work",
        color: "#64748b",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]);
    mockDb.select.mockReturnValue(chain);

    const { loader } = await import("./api.tags");
    const response = await loader();
    const body = await response.json();

    expect(body).toEqual(expect.arrayContaining([expect.objectContaining({ name: "deep-work" })]));
  });
});
