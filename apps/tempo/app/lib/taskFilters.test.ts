import { describe, expect, it } from "vitest";
import { buildTaskFilterInput, filterTodos, parseTaskFilterInput } from "./taskFilters";

describe("taskFilters", () => {
  it("parses text and tag filters from search input", () => {
    expect(parseTaskFilterInput("ship notes #client-launch")).toEqual({
      tag: "client-launch",
      search: "ship notes",
    });
  });

  it("rebuilds filter input from query state", () => {
    expect(buildTaskFilterInput({ search: "ship notes", tag: "client-launch" })).toBe(
      "ship notes #client-launch",
    );
  });

  it("filters tasks by title and tag together", () => {
    const todos = [
      {
        id: 1,
        userId: "demo",
        title: "Ship launch notes",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: false,
        createdAt: null,
        updatedAt: null,
        tags: [
          {
            id: 1,
            userId: "demo",
            name: "client-launch",
            normalizedName: "client-launch",
            color: null,
            createdAt: null,
            updatedAt: null,
          },
        ],
      },
      {
        id: 2,
        userId: "demo",
        title: "Inbox zero",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: false,
        createdAt: null,
        updatedAt: null,
        tags: [],
      },
    ];

    expect(filterTodos(todos, { search: "ship", tag: "client-launch" })).toHaveLength(1);
    expect(filterTodos(todos, { search: "", tag: "missing-tag" })).toHaveLength(0);
  });
});
