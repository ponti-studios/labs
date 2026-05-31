import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";

type PersistedStorageOptions<TValue> = {
  queryKey: QueryKey;
  read: () => TValue | null;
  write: (value: TValue) => void;
};

export function usePersistedStorageQuery<TValue>({
  queryKey,
  read,
  write,
}: PersistedStorageOptions<TValue>) {
  const queryClient = useQueryClient();
  const initialValue = typeof window === "undefined" ? undefined : read();

  const valueQuery = useQuery({
    queryKey,
    queryFn: read,
    initialData: initialValue,
    enabled: typeof window !== "undefined",
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const saveValueMutation = useMutation({
    mutationFn: async (value: TValue) => {
      write(value);
      return value;
    },
    onSuccess: (value) => {
      queryClient.setQueryData(queryKey, value);
    },
  });

  return {
    value: valueQuery.data ?? null,
    isLoading: valueQuery.isLoading,
    saveValue: saveValueMutation.mutate,
    isSaving: saveValueMutation.isPending,
  };
}
