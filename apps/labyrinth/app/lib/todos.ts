export type Todo = {
  id: number;
  title: string;
  projectId: number;
  start?: string;
  end?: string;
  completed?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useTodos() {
  return {
    data: [] as Todo[],
    isLoading: false,
    error: null as Error | null,
  };
}

export function useDeleteTodo() {
  return {
    mutate: () => undefined,
    isPending: false,
  };
}
