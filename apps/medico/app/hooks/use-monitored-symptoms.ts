import type { PatientSymptom, Symptom } from "../types/symptom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

const DB_NAME = "medico-symptom-tracker";
const STORE_NAME = "monitored-symptoms";
const DB_VERSION = 1;
const QUERY_KEY = "monitoredSymptoms";

export function useMonitoredSymptoms() {
  const queryClient = useQueryClient();

  // Query to fetch all monitored symptoms
  const monitoredSymptomsQuery = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getMonitoredSymptoms,
  });

  // Mutation to add a symptom to monitoring
  const addSymptomMutation = useMutation({
    mutationFn: saveMonitoredSymptom,
    onSuccess: () => {
      // Invalidate and refetch
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

  // Mutation to update an existing symptom
  const updateSymptomMutation = useMutation({
    mutationFn: updateMonitoredSymptom,
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

  // Mutation to remove a symptom from monitoring
  const removeSymptomMutation = useMutation({
    mutationFn: removeMonitoredSymptom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast("Symptom removed from monitoring");
    },
  });

  const resolveSymptom = useMutation({
    mutationFn: resolveMonitoredSymptom,
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

  // Group symptoms by resolved status
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

// Open database connection
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

// Add or update a symptom to monitor
export const saveMonitoredSymptom = async (symptom: Symptom): Promise<Symptom> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Add timestamp for monitoring
    const timestamp = new Date().toISOString();
    const symptomToStore: PatientSymptom = {
      ...symptom,
      id: crypto.randomUUID(),
      updatedAt: timestamp,
      createdAt: timestamp,
      resolvedAt: undefined,
    };

    const request = store.put(symptomToStore);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(symptomToStore);

    transaction.oncomplete = () => db.close();
  });
};

// Get all monitored symptoms
export const getMonitoredSymptoms = async (): Promise<PatientSymptom[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    transaction.oncomplete = () => db.close();
  });
};

export const resolveMonitoredSymptom = async (symptom: PatientSymptom): Promise<PatientSymptom> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const updatedSymptom: PatientSymptom = {
      ...symptom,
      resolvedAt: new Date().toISOString(),
    };

    const updateRequest = store.put({
      ...symptom,
      resolvedAt: new Date().toISOString(),
    });

    updateRequest.onerror = () => reject(updateRequest.error);
    updateRequest.onsuccess = () => resolve(updatedSymptom);
    transaction.oncomplete = () => db.close();
  });
};

// Remove a symptom from monitoring
export const removeMonitoredSymptom = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => db.close();
  });
};

// Update an existing monitored symptom
export const updateMonitoredSymptom = async (symptom: PatientSymptom): Promise<PatientSymptom> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(symptom);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(symptom);

    transaction.oncomplete = () => db.close();
  });
};
