import { Button } from "@pontistudios/ui/primitives";
import { useMonitoredSymptoms } from "../hooks/use-monitored-symptoms";
import { type Symptom, TREATMENT_GUIDANCE } from "../types/symptom";
import React from "react";
import { Link } from "react-router";

type DiagnosisActionButtonProps = {
  guidance: Symptom["treatment_guidance"];
  symptom: Symptom;
};

export const DiagnosisActionButton = React.memo(function DiagnosisAction({
  guidance,
  symptom,
}: DiagnosisActionButtonProps) {
  switch (guidance) {
    case TREATMENT_GUIDANCE.IMMEDIATE_CARE:
      return (
        <Button variant="destructive" asChild>
          <Link to="/hospitals">Find Immediate Care</Link>
        </Button>
      );
    case TREATMENT_GUIDANCE.NONIMMEDIATE_CARE:
      return (
        <Button asChild>
          <Link to="/appointments/new">Schedule Appointment</Link>
        </Button>
      );
    case TREATMENT_GUIDANCE.NO_CARE:
      return <MonitorSymptom symptom={symptom} />;
    default:
      return null;
  }
});

function MonitorSymptom({ symptom }: { symptom: Symptom }) {
  const { monitoredSymptoms, addSymptom } = useMonitoredSymptoms();

  const monitored = monitoredSymptoms.find((s) => s.name === symptom.name && !s.resolvedAt);

  if (monitored) {
    return (
      <Button variant="outline" asChild>
        <Link to={`/symptoms/${monitored.id}`}>Update Symptom</Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={() => addSymptom(symptom)}>
      Monitor Symptoms
    </Button>
  );
}
