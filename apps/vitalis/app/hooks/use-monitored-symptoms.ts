import type { PatientSymptom, Symptom } from "../types/symptom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

const QUERY_KEY = "monitoredSymptoms";

let inMemorySymptoms: PatientSymptom[] = [];

export function useMonitoredSymptoms() {
  const queryClient = useQueryClient();

  const monitoredSymptomsQuery = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => [...inMemorySymptoms],
  });

  const addSymptomMutation = useMutation({
    mutationFn: async (symptom: Symptom) => {
      const timestamp = new Date().toISOString();
      const newSymptom: PatientSymptom = {
        ...symptom,
        id: crypto.randomUUID(),
        updatedAt: timestamp,
        createdAt: timestamp,
        resolvedAt: undefined,
      };
      inMemorySymptoms = [...inMemorySymptoms, newSymptom];
      return newSymptom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast("Symptom added to monitoring", {
        description: "You can track this symptom's progress over time.",
      });
    },
    onError: (error) => {
      toast("Error saving symptom", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        classNames: { toast: "bg-destructive/10 text-destructive" },
      });
    },
  });

  const updateSymptomMutation = useMutation({
    mutationFn: async (symptom: PatientSymptom) => {
      const updated: PatientSymptom = {
        ...symptom,
        updatedAt: new Date().toISOString(),
      };
      inMemorySymptoms = inMemorySymptoms.map((s) =>
        s.id === symptom.id ? updated : s,
      );
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast("Symptom updated", {
        description: "Your symptom information has been updated.",
      });
    },
    onError: (error) => {
      toast("Error updating symptom", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        classNames: { toast: "bg-destructive/10 text-destructive" },
      });
    },
  });

  const removeSymptomMutation = useMutation({
    mutationFn: async (id: string) => {
      inMemorySymptoms = inMemorySymptoms.filter((s) => s.id !== id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast("Symptom removed from monitoring");
    },
  });

  const resolveSymptom = useMutation({
    mutationFn: async (symptom: PatientSymptom) => {
      const updated: PatientSymptom = {
        ...symptom,
        resolvedAt: new Date().toISOString(),
      };
      inMemorySymptoms = inMemorySymptoms.map((s) =>
        s.id === symptom.id ? updated : s,
      );
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast("Symptom resolved", {
        description: "You can now stop monitoring this symptom.",
      });
    },
    onError: (error) => {
      toast("Error resolving symptom", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        classNames: { toast: "bg-destructive/10 text-destructive" },
      });
    },
  });

  const activeSymptoms = useMemo(
    () => monitoredSymptomsQuery.data?.filter((s) => !s.resolvedAt) || [],
    [monitoredSymptomsQuery.data],
  );

  const resolvedSymptoms = useMemo(
    () => monitoredSymptomsQuery.data?.filter((s) => s.resolvedAt) || [],
    [monitoredSymptomsQuery.data],
  );

  return {
    monitoredSymptoms: monitoredSymptomsQuery.data || [],
    isLoading: monitoredSymptomsQuery.isLoading,
    addSymptom: addSymptomMutation.mutate,
    updateSymptom: updateSymptomMutation.mutate,
    removeSymptom: removeSymptomMutation.mutate,
    resolveSymptom,
    activeSymptoms,
    resolvedSymptoms,
  };
}
