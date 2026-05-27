import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskFormModal } from "./TaskFormModal";

vi.mock("~/lib/tags", () => ({
  DEFAULT_TAG_COLOR: "#64748b",
  normalizeTagName: (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  resolveTagColor: (color: string | null | undefined) => color || "#64748b",
  useTags: () => ({
    data: [
      {
        id: 1,
        name: "deep-work",
        normalizedName: "deep-work",
        color: "#64748b",
        userId: "u",
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 2,
        name: "writing",
        normalizedName: "writing",
        color: "#64748b",
        userId: "u",
        createdAt: null,
        updatedAt: null,
      },
    ],
    isLoading: false,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TaskFormModal", () => {
  it("does not close on submit while isLoading=true", async () => {
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <TaskFormModal
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
        isLoading={true}
      />,
      { wrapper },
    );

    await userEvent.type(screen.getByLabelText(/title/i), "My task");

    const submitButton = screen.getByRole("button", { name: /adding/i });
    expect(submitButton).toBeDisabled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("allows creating a task without selecting any tags", async () => {
    const onSubmit = vi.fn();

    render(<TaskFormModal open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />, { wrapper });

    await userEvent.type(screen.getByLabelText(/title/i), "Inbox zero");
    await userEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Inbox zero",
        tags: [],
        completed: false,
      }),
    );
  });

  it("reuses an existing tag when enter matches it exactly", async () => {
    const onSubmit = vi.fn();

    render(<TaskFormModal open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />, { wrapper });

    await userEvent.type(screen.getByLabelText(/title/i), "Write essay");
    await userEvent.click(screen.getByRole("button", { name: /tag/i }));
    await userEvent.type(screen.getByPlaceholderText(/search or create a tag/i), "Writing{enter}");
    await userEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ["writing"],
      }),
    );
  });

  it("shows duplicate feedback when the entered tag is already selected", async () => {
    render(<TaskFormModal open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />, { wrapper });

    await userEvent.type(screen.getByLabelText(/title/i), "Plan day");
    await userEvent.click(screen.getByRole("button", { name: /tag/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/search or create a tag/i),
      "deep work{enter}",
    );
    await userEvent.click(screen.getByRole("button", { name: /tag/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/search or create a tag/i),
      "deep work{enter}",
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/already exists and is selected/i);
    });
  });

  it("renders inline error instead of calling alert()", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const onSubmit = vi.fn();

    render(
      <TaskFormModal open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} error="Server error" />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Server error");
    });

    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("edit/delete buttons have accessible labels", async () => {
    const { TaskListItem } = await import("./TaskListItem");
    const todo = {
      id: 1,
      userId: "u",
      title: "Task",
      start: "2024-01-01",
      end: "2024-01-02",
      completed: false,
      createdAt: null,
      updatedAt: null,
      tags: [],
    };

    render(
      <TaskListItem todo={todo} onDelete={vi.fn()} onEdit={vi.fn()} isDeletePending={false} />,
      { wrapper },
    );

    expect(screen.getByRole("button", { name: /edit task/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete task/i })).toBeInTheDocument();
  });
});
