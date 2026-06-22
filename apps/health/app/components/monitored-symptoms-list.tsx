import { Button } from "@pontistudios/ui";
import { useMonitoredSymptoms } from "../hooks/use-monitored-symptoms";
import { cn } from "@pontistudios/ui";
import type { PatientSymptom } from "../types/symptom";
import { TREATMENT_GUIDANCE } from "../types/symptom";
import { formatDistanceToNow } from "date-fns";
import { memo, useCallback } from "react";

const MonitoredSymptomItem = memo(
  ({
    symptom,
    onResolve,
  }: {
    symptom: PatientSymptom;
    onResolve: (symptom: PatientSymptom) => void;
  }) => {
    const handleResolve = useCallback(() => {
      onResolve(symptom);
    }, [symptom, onResolve]);

    return (
      <div className="flex items-center justify-between gap-3 rounded-md border p-4 transition-colors duration-200 hover:bg-slate-50">
        <div className="flex flex-col gap-2">
          <h3
            className={cn("font-medium", {
              "text-green-600": symptom.treatment_guidance === TREATMENT_GUIDANCE.NO_CARE,
              "text-amber-600": symptom.treatment_guidance === TREATMENT_GUIDANCE.NONIMMEDIATE_CARE,
              "text-red-600": symptom.treatment_guidance === TREATMENT_GUIDANCE.IMMEDIATE_CARE,
            })}
          >
            {symptom.name}
          </h3>
          <p className="text-sm text-gray-500">
            Started {formatDistanceToNow(new Date(symptom.createdAt))} ago
          </p>
          {symptom.resolvedAt && (
            <span className="inline-flex w-fit rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
              Resolved
            </span>
          )}
        </div>
        {!symptom.resolvedAt && (
          <Button variant="outline" size="sm" onClick={handleResolve}>
            Resolve
          </Button>
        )}
      </div>
    );
  },
);

MonitoredSymptomItem.displayName = "MonitoredSymptomItem";

export default function MonitoredSymptomsList() {
  const { activeSymptoms, resolvedSymptoms, isLoading, resolveSymptom } = useMonitoredSymptoms();

  const handleResolve = useCallback(
    (symptom: PatientSymptom) => {
      resolveSymptom.mutate(symptom);
    },
    [resolveSymptom],
  );

  if (isLoading) {
    return <div className="py-8 text-center">Loading monitored symptoms...</div>;
  }

  if (activeSymptoms.length === 0 && resolvedSymptoms.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">No symptoms currently being monitored</div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-xl font-semibold">Monitored Symptoms</h2>

      {activeSymptoms.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-md font-medium text-gray-600">Active</h3>
          <div className="flex flex-col gap-3">
            {activeSymptoms.map((symptom) => (
              <MonitoredSymptomItem key={symptom.id} symptom={symptom} onResolve={handleResolve} />
            ))}
          </div>
        </div>
      )}

      {resolvedSymptoms.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-md font-medium text-gray-600">Resolved</h3>
          <div className="flex flex-col gap-3">
            {resolvedSymptoms.map((symptom) => (
              <MonitoredSymptomItem key={symptom.id} symptom={symptom} onResolve={handleResolve} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
