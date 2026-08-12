import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadAdminOverviewMock,
  loadAdminInventoryMock,
  loadAdminGenerationMock,
  loadAdminTopicsMock,
} = vi.hoisted(() => ({
  loadAdminOverviewMock: vi.fn(),
  loadAdminInventoryMock: vi.fn(),
  loadAdminGenerationMock: vi.fn(),
  loadAdminTopicsMock: vi.fn(),
}));

vi.mock("~/lib/realitea/admin/inventory", () => ({
  loadAdminOverview: loadAdminOverviewMock,
  loadAdminInventory: loadAdminInventoryMock,
  loadAdminGeneration: loadAdminGenerationMock,
}));

vi.mock("~/lib/realitea/admin/articles.server", () => ({
  loadAdminTopics: loadAdminTopicsMock,
}));

function createLoaderArgs(url: string): LoaderFunctionArgs {
  const request = new Request(url);
  return {
    context: {},
    params: {},
    pattern: "",
    request,
    url: new URL(request.url),
  } as LoaderFunctionArgs;
}

describe("RealiTea admin topics loader", () => {
  beforeEach(() => {
    loadAdminTopicsMock.mockReset();
  });

  it("loads topics for an authenticated admin", async () => {
    loadAdminTopicsMock.mockResolvedValue([{ slug: "rhobh", counts: { pending: 2 } }]);
    const { loader } = await import("../admin/topics");
    const result = await loader();
    expect(result).toEqual({ topics: [{ slug: "rhobh", counts: { pending: 2 } }] });
  });
});

describe("RealiTea admin inventory loader", () => {
  beforeEach(() => {
    loadAdminInventoryMock.mockReset();
  });

  it("loads the full inventory for an authenticated admin", async () => {
    loadAdminInventoryMock.mockResolvedValue({ game: { slug: "rhobh" }, cells: [] });
    const { loader } = await import("../admin/inventory");
    const result = await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/admin/inventory"));
    expect(result).toEqual({ game: { slug: "rhobh" }, cells: [] });
    expect(loadAdminInventoryMock).toHaveBeenCalledWith("rhobh");
  });
});

describe("RealiTea admin generation loader", () => {
  beforeEach(() => {
    loadAdminGenerationMock.mockReset();
  });

  it("loads a generation for an authenticated admin", async () => {
    loadAdminGenerationMock.mockResolvedValue({
      game: { slug: "rhobh" },
      generation: { id: 9, candidates: [] },
    });
    const { loader } = await import("../admin/generations.$id");
    const args = createLoaderArgs("https://labs.ponti.io/games/realitea/admin/generations/9");
    args.params = { id: "9" };
    const result = await loader(args);
    expect(result).toEqual({ game: { slug: "rhobh" }, generation: { id: 9, candidates: [] } });
    expect(loadAdminGenerationMock).toHaveBeenCalledWith("rhobh", 9);
  });

  it("throws 404 when the generation is missing", async () => {
    loadAdminGenerationMock.mockResolvedValue(null);
    const { loader } = await import("../admin/generations.$id");
    const args = createLoaderArgs("https://labs.ponti.io/games/realitea/admin/generations/9");
    args.params = { id: "9" };
    await expect(loader(args)).rejects.toMatchObject({ status: 404 });
  });
});

describe("RealiTea admin overview loader", () => {
  beforeEach(() => {
    loadAdminOverviewMock.mockReset();
  });

  it("loads the inventory overview for an authenticated admin", async () => {
    loadAdminOverviewMock.mockResolvedValue({ game: { slug: "rhobh" }, cells: [] });
    const { loader } = await import("../admin/route");
    const result = await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/admin"));
    expect(result).toEqual({ game: { slug: "rhobh" }, cells: [] });
    expect(loadAdminOverviewMock).toHaveBeenCalledWith("rhobh");
  });

  it("throws 404 when no topic exists", async () => {
    loadAdminOverviewMock.mockResolvedValue(null);
    const { loader } = await import("../admin/route");
    await expect(loader(createLoaderArgs("https://labs.ponti.io/games/realitea/admin"))).rejects.toMatchObject({
      status: 404,
    });
  });
});
