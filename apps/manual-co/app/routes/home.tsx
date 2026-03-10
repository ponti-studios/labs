import { useSymptomForm } from "../hooks/use-symptom-form";
import { TREATMENT_GUIDANCE, type TreatmentGuidance } from "../types/symptom";
import SymptomCard from "../components/symptom-card";
import MonitoredSymptomsList from "../components/monitored-symptoms-list";
import { Button, Input, Label } from "@pontistudios/ui";
import { cn } from "@pontistudios/ui";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const { symptom, setSymptom, handleSubmit, isDisabled, isPending, data, error } =
    useSymptomForm();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setShowResults(false);

    if (data) {
      const timer = setTimeout(() => {
        setShowResults(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleSymptomSelect = useCallback(
    (selectedSymptom: string) => {
      setSymptom(selectedSymptom);
    },
    [setSymptom],
  );

  return (
    <div className="container mx-auto min-h-screen max-w-md flex flex-col justify-center">
      <div className="flex flex-col items-center px-4">
        <div className="flex flex-col items-center gap-2 my-8">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-center fade-in-40 duration-500 ease-in-out">
            symptom guidance
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <Label htmlFor="symptom-input" className="text-gray-500">
            What are you experiencing?
          </Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              id="symptom-input"
              type="text"
              placeholder="Enter symptom"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              disabled={isPending}
              data-testid="symptom-input"
            />
            <Button type="submit" disabled={isDisabled} data-testid="symptom-submit-button">
              {isPending ? "Checking..." : "Check"}
            </Button>
          </div>
          {!showResults || (showResults && symptom.length === 0) ? (
            <div className="flex flex-col items-center">
              <ul className="list-disc gap-1 grid grid-cols-3">
                <SampleSymptomButton
                  symptom="Headache"
                  severity={TREATMENT_GUIDANCE.NO_CARE}
                  onSelect={handleSymptomSelect}
                />
                <SampleSymptomButton
                  symptom="Night sweats"
                  severity={TREATMENT_GUIDANCE.NONIMMEDIATE_CARE}
                  onSelect={handleSymptomSelect}
                />
                <SampleSymptomButton
                  symptom="Severe chest pain"
                  severity={TREATMENT_GUIDANCE.IMMEDIATE_CARE}
                  onSelect={handleSymptomSelect}
                />
              </ul>
            </div>
          ) : null}
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
              {error.message}
            </div>
          )}
        </form>

        <div className="flex flex-col items-center mt-8 max-w-full">
          {data && (
            <div
              className={cn("transition-opacity duration-500 ease-in-out", {
                "opacity-100": showResults,
                "opacity-0": !showResults,
              })}
            >
              <SymptomCard symptom={data} />
            </div>
          )}

          {data?.alternatives?.length && data.alternatives.length > 0 ? (
            <div
              className={cn("mt-8 w-full max-w-4xl transition-opacity duration-500 ease-in-out", {
                "opacity-100": showResults,
                "opacity-0": !showResults,
              })}
            >
              <h2 className="text-md font-semibold mb-4 text-gray-400">Alternative Matches</h2>
              <div className="carousel flex gap-4 overflow-x-auto rounded-box">
                {data.alternatives.map((alt, index) => (
                  <SymptomCard
                    className="carousel-item"
                    key={`${alt.name}-${index}`}
                    symptom={alt}
                    isAlternative={true}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-16 w-full">
          <MonitoredSymptomsList />
        </div>
      </div>

      <footer className="mt-auto py-4 text-center">
        <p className="text-sm text-muted-foreground">manual.co demo</p>
      </footer>
    </div>
  );
}

function SampleSymptomButton({
  onSelect,
  symptom,
  severity,
}: {
  onSelect: (symptom: string) => void;
  severity: TreatmentGuidance;
  symptom: string;
}) {
  return (
    <button
      type="button"
      className={cn("px-2 py-1 border-dotted border-2 rounded-md cursor-pointer text-sm", {
        "border-green-200": severity === TREATMENT_GUIDANCE.NO_CARE,
        "border-amber-200": severity === TREATMENT_GUIDANCE.NONIMMEDIATE_CARE,
        "border-red-200": severity === TREATMENT_GUIDANCE.IMMEDIATE_CARE,
      })}
      onClick={() => onSelect(symptom)}
    >
      {symptom}
    </button>
  );
}
