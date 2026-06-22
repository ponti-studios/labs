import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { STORAGE_KEYS, storageGet, storageSet } from "../lib/storage";
import type { Appointment } from "../types/appointment";

const KEY = STORAGE_KEYS.appointments;

export function useAppointments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: () => storageGet<Appointment[]>(KEY, []),
  });

  const addAppointment = useMutation({
    mutationFn: async (appt: Omit<Appointment, "id" | "createdAt" | "status">) => {
      const current = storageGet<Appointment[]>(KEY, []);
      const newAppt: Appointment = {
        ...appt,
        id: crypto.randomUUID(),
        status: "upcoming",
        createdAt: new Date().toISOString(),
      };
      storageSet(KEY, [...current, newAppt]);
      return newAppt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast("Appointment scheduled", {
        description: "Added to your upcoming appointments.",
      });
    },
    onError: (error) => {
      toast("Error scheduling appointment", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (id: string) => {
      const current = storageGet<Appointment[]>(KEY, []);
      storageSet(
        KEY,
        current.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast("Appointment cancelled");
    },
  });

  const upcoming = query.data?.filter((a) => a.status === "upcoming") ?? [];
  const past = query.data?.filter((a) => a.status !== "upcoming") ?? [];

  return {
    appointments: query.data ?? [],
    upcoming,
    past,
    isLoading: query.isLoading,
    addAppointment,
    cancelAppointment,
  };
}
