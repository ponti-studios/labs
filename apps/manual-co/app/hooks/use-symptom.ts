import type { SymptomRequest, SymptomRequestResponse } from "@/types/symptom";
import { useMutation } from "@tanstack/react-query";

export function useSymptom() {
  return useMutation<SymptomRequestResponse, Error, SymptomRequest>({
    mutationFn: async (data) => {
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch("/api/symptom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "An error occurred");
      }

      return response.json();
    },
  });
}
