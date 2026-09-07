import { describe, expect, it } from "vitest";

import { loader } from "./toys.layouts.$layout";

type LoaderArgs = Parameters<typeof loader>[0];

function makeArgs(layout: string): LoaderArgs {
  return {
    params: { layout },
    request: new Request(`https://labs.ponti.io/toys/layouts/${layout}`),
  } as unknown as LoaderArgs;
}

describe("toys layouts route", () => {
  it("resolves the vertical layout", async () => {
    const data = await loader(makeArgs("vertical"));

    expect(data).toEqual({ layoutId: "vertical" });
  });

  it("resolves the horizontal layout", async () => {
    const data = await loader(makeArgs("horizontal"));

    expect(data).toEqual({ layoutId: "horizontal" });
  });

  it("throws a 404 for an unknown layout", async () => {
    let thrown: Response | undefined;
    try {
      await loader(makeArgs("masonry"));
    } catch (error) {
      thrown = error as Response;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect(thrown?.status).toBe(404);
  });
});