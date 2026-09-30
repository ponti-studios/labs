import { describe, expect, it } from "vitest";

import { DbEnv } from "./env";

describe("DbEnv", () => {
  it("maps DATABASE_URL to the database client URL", () => {
    expect(DbEnv.parse({ DATABASE_URL: "postgresql://localhost/hominem" })).toEqual({
      url: "postgresql://localhost/hominem",
    });
  });

  it("rejects a missing database URL", () => {
    expect(DbEnv.safeParse({}).success).toBe(false);
    expect(DbEnv.safeParse({ DATABASE_URL: "  " }).success).toBe(false);
  });
});
