import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface TodoItem {
  id: number;
  userId: string;
  projectId: number | null;
  title: string;
  start: string;
  end: string;
  completed: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  projectName?: string | null;
}

export interface TodoCreateData {
  projectId: number | null;
  title: string;
  start: string;
  end: string;
  completed: boolean;
}

export const useTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: async (): Promise<TodoItem[]> => {
      const response = await fetch("/api/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      return (await response.json()) as TodoItem[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTodo: TodoCreateData): Promise<TodoItem> => {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      return (await response.json()) as TodoItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedTodo: TodoItem): Promise<TodoItem> => {
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      return (await response.json()) as TodoItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<number> => {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
