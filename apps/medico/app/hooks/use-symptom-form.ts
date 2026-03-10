import { useCallback, useState } from "react";
import { useSymptom } from "./use-symptom";

export function useSymptomForm() {
  const [symptom, setSymptom] = useState("");
  const { mutate, data, error, isPending } = useSymptom();

  const isValid = symptom.trim().length > 0;
  const isDisabled = isPending || !isValid;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!isValid) return;
      mutate({ symptom });
    },
    [mutate, symptom, isValid],
  );

  return {
    symptom,
    setSymptom,
    handleSubmit,
    isDisabled,
    isPending,
    data,
    error,
  };
}
