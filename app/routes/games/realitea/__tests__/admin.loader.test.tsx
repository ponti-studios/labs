import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireRealiteaAdminMock,
  loadAdminOverviewMock,
  loadAdminInventoryMock,
  loadAdminGenerationMock,
} = vi.hoisted(() => ({
  requireRealiteaAdminMock: vi.fn(),
  loadAdminOverviewMock: vi.fn(),
  loadAdminInventoryMock: vi.fn(),
  loadAdminGenerationMock: vi.fn(),
}));

vi.mock("~/lib/realitea/admin/auth", () => ({
  requireRealiteaAdmin: requireRealiteaAdminMock,
}));

vi.mock("~/lib/realitea/admin/inventory", () => ({
  loadAdminOverview: loadAdminOverviewMock,
  loadAdminInventory: loadAdminInventoryMock,
  loadAdminGeneration: loadAdminGenerationMock,
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

describe("RealiTea admin inventory loader", () => {
  beforeEach(() => {
    requireRealiteaAdminMock.mockReset();
    loadAdminInventoryMock.mockReset();
  });

  it("loads the full inventory for an authenticated admin", async () => {
    requireRealiteaAdminMock.mockResolvedValue({ user: { id: "u1", email: "ops@ponti.io" } });
    loadAdminInventoryMock.mockResolvedValue({ game: { slug: "rhobh" }, cells: [] });
    const { loader } = await import("../admin/inventory");
    const result = await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/admin/inventory"));
    expect(result).toEqual({ game: { slug: "rhobh" }, cells: [] });
    expect(loadAdminInventoryMock).toHaveBeenCalledWith("rhobh");
  });
});

describe("RealiTea admin generation loader", () => {
  beforeEach(() => {
    requireRealiteaAdminMock.mockReset();
    loadAdminGenerationMock.mockReset();
  });

  it("loads a generation for an authenticated admin", async () => {
    requireRealiteaAdminMock.mockResolvedValue({ user: { id: "u1", email: "ops@ponti.io" } });
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
    requireRealiteaAdminMock.mockResolvedValue({ user: { id: "u1", email: "ops@ponti.io" } });
    loadAdminGenerationMock.mockResolvedValue(null);
    const { loader } = await import("../admin/generations.$id");
    const args = createLoaderArgs("https://labs.ponti.io/games/realitea/admin/generations/9");
    args.params = { id: "9" };
    await expect(loader(args)).rejects.toMatchObject({ status: 404 });
  });
});

describe("RealiTea admin overview loader", () => {
  beforeEach(() => {
    requireRealiteaAdminMock.mockReset();
    loadAdminOverviewMock.mockReset();
  });

  it("does not load inventory when auth throws", async () => {
    requireRealiteaAdminMock.mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    const { loader } = await import("../admin/route");
    await expect(
      loader(createLoaderArgs("https://labs.ponti.io/games/realitea/admin")),
    ).rejects.toMatchObject({ status: 401 });
    expect(loadAdminOverviewMock).not.toHaveBeenCalled();
  });

  it("loads the inventory overview for an authenticated admin", async () => {
    requireRealiteaAdminMock.mockResolvedValue({ user: { id: "u1", email: "ops@ponti.io" } });
    loadAdminOverviewMock.mockResolvedValue({ game: { slug: "rhobh" }, cells: [] });
    const { loader } = await import("../admin/route");
    const result = await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/admin"));
    expect(result).toEqual({ game: { slug: "rhobh" }, cells: [] });
    expect(loadAdminOverviewMock).toHaveBeenCalledWith("rhobh");
  });

  it("throws 404 when no topic exists", async () => {
    requireRealiteaAdminMock.mockResolvedValue({ user: { id: "u1", email: "ops@ponti.io" } });
    loadAdminOverviewMock.mockResolvedValue(null);
    const { loader } = await import("../admin/route");
    await expect(loader(createLoaderArgs("https://labs.ponti.io/games/realitea/admin"))).rejects.toMatchObject({
      status: 404,
    });
  });
});
