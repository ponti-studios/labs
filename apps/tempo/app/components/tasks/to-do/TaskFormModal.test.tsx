import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskFormModal } from "./TaskFormModal";

vi.mock("~/lib/projects", () => ({
  useProjects: () => ({
    data: [{ id: 1, name: "Project A", description: null, taskCount: 0, userId: "u", createdAt: null, updatedAt: null }],
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

    const titleInput = screen.getByLabelText(/title/i);
    await userEvent.type(titleInput, "My task");

    const projectSelect = screen.getByLabelText(/project/i);
    await userEvent.selectOptions(projectSelect, "1");

    const submitButton = screen.getByRole("button", { name: /adding/i });
    expect(submitButton).toBeDisabled();

    // Modal should still be open (onOpenChange not called with false)
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("allows creating a task without selecting a project", async () => {
    const onSubmit = vi.fn();

    render(
      <TaskFormModal open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />,
      { wrapper },
    );

    await userEvent.type(screen.getByLabelText(/title/i), "Inbox zero");
    await userEvent.click(screen.getByRole("button", { name: /add todo/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Inbox zero",
        projectId: null,
        completed: false,
      }),
    );
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
    // Import TaskListItem to verify aria-label presence
    const { TaskListItem } = await import("./TaskListItem");
    const todo = {
      id: 1,
      userId: "u",
      projectId: 1,
      title: "Task",
      start: "2024-01-01",
      end: "2024-01-02",
      completed: false,
      createdAt: null,
      updatedAt: null,
      projectName: "Project A",
    };

    render(
      <TaskListItem todo={todo} onDelete={vi.fn()} onEdit={vi.fn()} isDeletePending={false} />,
      { wrapper },
    );

    expect(screen.getByRole("button", { name: /edit task/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete task/i })).toBeInTheDocument();
  });
});
