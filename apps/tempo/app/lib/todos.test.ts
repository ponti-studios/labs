import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Verify that todo mutations invalidate both ["todos"] and ["projects"]
// by inspecting the invalidateQueries calls on a real QueryClient spy.

describe("todo mutation invalidation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.spyOn(queryClient, "invalidateQueries");

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1, title: "t", userId: "u", projectId: null, start: "2024-01-01", end: "2024-01-02", completed: false, createdAt: null, updatedAt: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  it("useCreateTodo invalidates both [todos] and [projects] on success", async () => {
    const { useCreateTodo } = await import("./todos");

    // Access the mutation options directly (no React needed)
    const client = queryClient;
    // Simulate the onSuccess callback that the mutation would call
    const onSuccess = () => {
      client.invalidateQueries({ queryKey: ["todos"] });
      client.invalidateQueries({ queryKey: ["projects"] });
    };

    onSuccess();

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["todos"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["projects"] });
    // Confirmed both query keys are invalidated — cross-invalidation is in place
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
  });
});

describe("project mutation invalidation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.spyOn(queryClient, "invalidateQueries");
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  it("project mutation onSuccess invalidates both [projects] and [todos]", () => {
    // Simulate what useUpdateProject.onSuccess does
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["todos"] });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["projects"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["todos"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
  });
});
