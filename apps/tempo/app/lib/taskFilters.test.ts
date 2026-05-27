import { describe, expect, it } from "vitest";
import { buildTaskFilterInput, filterTodos, parseTaskFilterInput, slugifyProjectName } from "./taskFilters";

describe("taskFilters", () => {
  it("slugifies project names", () => {
    expect(slugifyProjectName("Client Launch")).toBe("client-launch");
  });

  it("parses text and project filters from search input", () => {
    expect(parseTaskFilterInput("ship notes #client-launch")).toEqual({
      project: "client-launch",
      search: "ship notes",
    });
  });

  it("rebuilds filter input from query state", () => {
    expect(buildTaskFilterInput({ search: "ship notes", project: "client-launch" })).toBe(
      "ship notes #client-launch",
    );
  });

  it("filters tasks by title and project slug together", () => {
    const todos = [
      {
        id: 1,
        userId: "demo",
        projectId: 1,
        title: "Ship launch notes",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: false,
        createdAt: null,
        updatedAt: null,
        projectName: "Client Launch",
      },
      {
        id: 2,
        userId: "demo",
        projectId: null,
        title: "Inbox zero",
        start: "2024-01-01",
        end: "2024-01-01",
        completed: false,
        createdAt: null,
        updatedAt: null,
        projectName: null,
      },
    ];

    expect(filterTodos(todos, { search: "ship", project: "client-launch" })).toHaveLength(1);
    expect(filterTodos(todos, { search: "", project: "missing-project" })).toHaveLength(0);
  });
});
