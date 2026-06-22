import { useCallback } from "react";
import { useSymptom } from "./use-symptom";
import { useSymptomContext } from "../context/symptom-context";

export function useSymptomForm() {
  const { input, setInput, result, setResult } = useSymptomContext();
  const { mutate, isPending, error } = useSymptom();

  const isValid = input.trim().length > 0;
  const isDisabled = isPending || !isValid;

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!isValid) return;
      mutate({ symptom: input }, { onSuccess: (data) => setResult(data) });
    },
    [mutate, input, isValid, setResult],
  );

  return {
    symptom: input,
    setSymptom: setInput,
    handleSubmit,
    isDisabled,
    isPending,
    data: result,
    error,
  };
}
