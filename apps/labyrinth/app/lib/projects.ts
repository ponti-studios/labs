export type Project = {
  id: number;
  name: string;
  description?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  taskCount?: number;
};

export function useProjects() {
  return {
    data: [] as Project[],
    isLoading: false,
    error: null as Error | null,
  };
}
