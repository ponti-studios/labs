import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireRealiteaAdminMock, loadAdminOverviewMock } = vi.hoisted(() => ({
  requireRealiteaAdminMock: vi.fn(),
  loadAdminOverviewMock: vi.fn(),
}));

vi.mock("~/lib/realitea/admin/auth", () => ({
  requireRealiteaAdmin: requireRealiteaAdminMock,
}));

vi.mock("~/lib/realitea/admin/inventory", () => ({
  loadAdminOverview: loadAdminOverviewMock,
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
