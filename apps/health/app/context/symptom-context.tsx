import { createContext, useContext, useState } from "react";
import type { MatchedSymptom } from "../types/symptom";

type SymptomContextValue = {
  result: MatchedSymptom | null;
  setResult: (symptom: MatchedSymptom | null) => void;
  input: string;
  setInput: (value: string) => void;
};

const SymptomContext = createContext<SymptomContextValue | null>(null);

export function SymptomProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<MatchedSymptom | null>(null);
  const [input, setInput] = useState("");

  return (
    <SymptomContext.Provider value={{ result, setResult, input, setInput }}>
      {children}
    </SymptomContext.Provider>
  );
}

export function useSymptomContext() {
  const ctx = useContext(SymptomContext);
  if (!ctx) throw new Error("useSymptomContext must be used within SymptomProvider");
  return ctx;
}
