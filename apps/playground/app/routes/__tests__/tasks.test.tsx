import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TasksByProject from "../tasks.$projectId";

// Mock the hooks
vi.mock("~/lib/todos", () => ({
	useTodos: vi.fn(),
	useDeleteTodo: vi.fn(() => ({
		mutate: vi.fn(),
		isPending: false,
	})),
}));

vi.mock("~/lib/projects", () => ({
	useProjects: vi.fn(),
}));

vi.mock("~/components/to-do/TaskForm", () => ({
	default: () => <div data-testid="task-form">Task Form</div>,
}));

vi.mock("~/components/to-do/TaskList", () => ({
	TaskList: ({ todos }: { todos: any[] }) => (
		<div data-testid="task-list">
			{todos.map((todo) => (
				<div key={todo.id} data-testid={`todo-${todo.id}`}>
					{todo.title}
				</div>
			))}
		</div>
	),
}));

const mockTodos = [
	{
		id: 1,
		title: "Task 1",
		projectId: 1,
		start: "2024-01-01",
		end: "2024-01-01",
		completed: false,
		userId: "user1",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: 2,
		title: "Task 2",
		projectId: 1,
		start: "2024-01-02",
		end: "2024-01-02",
		completed: false,
		userId: "user1",
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
	},
	{
		id: 3,
		title: "Task 3",
		projectId: 2,
		start: "2024-01-03",
		end: "2024-01-03",
		completed: false,
		userId: "user1",
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-03T00:00:00Z",
	},
];

const mockProjects = [
	{
		id: 1,
		name: "Project 1",
		description: "First project",
		userId: "user1",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		taskCount: 2,
	},
	{
		id: 2,
		name: "Project 2",
		description: "Second project",
		userId: "user1",
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		taskCount: 1,
	},
];

describe("TasksByProject", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render tasks filtered by project", async () => {
		const { useTodos, useDeleteTodo } = await import("~/lib/todos");
		const { useProjects } = await import("~/lib/projects");

		vi.mocked(useTodos).mockReturnValue({
			data: mockTodos,
			isLoading: false,
			error: null,
		} as any);

		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			error: null,
		} as any);

		const router = createMemoryRouter(
			[
				{
					path: "/tasks/:projectId",
					element: <TasksByProject />,
				},
			],
			{
				initialEntries: ["/tasks/1"],
			},
		);

		render(<RouterProvider router={router} />);

		// Should show the project name
		expect(screen.getByText("Project 1")).toBeInTheDocument();

		// Should show the task count
		expect(screen.getByText("2 tasks")).toBeInTheDocument();

		// Should show only tasks for project 1
		expect(screen.getByTestId("todo-1")).toBeInTheDocument();
		expect(screen.getByTestId("todo-2")).toBeInTheDocument();
		expect(screen.queryByTestId("todo-3")).not.toBeInTheDocument();

		// Should show the task form
		expect(screen.getByTestId("task-form")).toBeInTheDocument();

		// Should show the task list
		expect(screen.getByTestId("task-list")).toBeInTheDocument();
	});

	it("should show loading state", async () => {
		const { useTodos, useDeleteTodo } = await import("~/lib/todos");
		const { useProjects } = await import("~/lib/projects");

		vi.mocked(useTodos).mockReturnValue({
			data: [],
			isLoading: true,
			error: null,
		} as any);

		vi.mocked(useProjects).mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
		} as any);

		const router = createMemoryRouter(
			[
				{
					path: "/tasks/:projectId",
					element: <TasksByProject />,
				},
			],
			{
				initialEntries: ["/tasks/1"],
			},
		);

		render(<RouterProvider router={router} />);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("should show error state", async () => {
		const { useTodos, useDeleteTodo } = await import("~/lib/todos");
		const { useProjects } = await import("~/lib/projects");

		vi.mocked(useTodos).mockReturnValue({
			data: [],
			isLoading: false,
			error: new Error("Failed to fetch todos"),
		} as any);

		vi.mocked(useProjects).mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
		} as any);

		const router = createMemoryRouter(
			[
				{
					path: "/tasks/:projectId",
					element: <TasksByProject />,
				},
			],
			{
				initialEntries: ["/tasks/1"],
			},
		);

		render(<RouterProvider router={router} />);

		expect(screen.getByText(/Error loading data/)).toBeInTheDocument();
	});

	it("should show project not found when project doesn't exist", async () => {
		const { useTodos, useDeleteTodo } = await import("~/lib/todos");
		const { useProjects } = await import("~/lib/projects");

		vi.mocked(useTodos).mockReturnValue({
			data: mockTodos,
			isLoading: false,
			error: null,
		} as any);

		vi.mocked(useProjects).mockReturnValue({
			data: mockProjects,
			isLoading: false,
			error: null,
		} as any);

		const router = createMemoryRouter(
			[
				{
					path: "/tasks/:projectId",
					element: <TasksByProject />,
				},
			],
			{
				initialEntries: ["/tasks/999"],
			},
		);

		render(<RouterProvider router={router} />);

		expect(screen.getByText("Project not found")).toBeInTheDocument();
	});
});
