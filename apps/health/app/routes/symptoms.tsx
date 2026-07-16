import { Input } from "@ponti-studios/ui/forms";
import { Label } from "@ponti-studios/ui/primitives";
import { useSymptomForm } from "../hooks/use-symptom-form";
import { TREATMENT_GUIDANCE, type TreatmentGuidance } from "../types/symptom";
import SymptomCard from "../components/symptom-card";
import { Button } from "@ponti-studios/ui/primitives";
import { cn } from "@ponti-studios/ui/utilities";
import { useCallback } from "react";

export default function Symptoms() {
  const { symptom, setSymptom, handleSubmit, isDisabled, isPending, data, error } =
    useSymptomForm();

  const handleSymptomSelect = useCallback((selected: string) => setSymptom(selected), [setSymptom]);

  return (
    <div className="container mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-8 px-4">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-center text-2xl font-bold tracking-tight md:text-4xl">
            symptom guidance
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
          <Label htmlFor="symptom-input" className="text-gray-500">
            What are you experiencing?
          </Label>
          <div className="flex w-full items-center gap-2">
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

          {!data || symptom.length === 0 ? (
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-2">
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
              </div>
            </div>
          ) : null}

          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {error.message}
            </div>
          )}
        </form>

        <div className="flex max-w-full flex-col items-center gap-8">
          {data && (
            <div className="opacity-100 transition-opacity duration-200 ease-in-out">
              <SymptomCard symptom={data} />
            </div>
          )}

          {data?.alternatives && data.alternatives.length > 0 ? (
            <div className="flex w-full max-w-4xl flex-col gap-4 opacity-100 transition-opacity duration-200 ease-in-out">
              <h2 className="text-md font-semibold text-gray-400">Alternative Matches</h2>
              <div className="carousel rounded-box flex gap-4 overflow-x-auto">
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
      </div>
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
      className={cn("cursor-pointer rounded-md border-2 border-dotted px-2 py-1 text-sm", {
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
