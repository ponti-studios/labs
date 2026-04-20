import { type Symptom, TREATMENT_GUIDANCE } from "../types/symptom";
import React from "react";
import { DiagnosisActionButton } from "./diagnosis-action-button";

const GUIDANCE_MESSAGES = {
  [TREATMENT_GUIDANCE.IMMEDIATE_CARE]: "Seek immediate medical attention",
  [TREATMENT_GUIDANCE.NONIMMEDIATE_CARE]: "Schedule an appointment with your healthcare provider",
  [TREATMENT_GUIDANCE.NO_CARE]: "Monitor symptoms and practice self-care",
  default: "Consult with your healthcare provider",
};

export const SymptomCardGuidance = React.memo(function SymptomGuidance({
  guidance,
  symptom,
}: {
  guidance: Symptom["treatment_guidance"];
  symptom: Symptom;
}) {
  // Determine the guidance message based on the treatment guidance
  const guidanceMessage = GUIDANCE_MESSAGES[guidance] || GUIDANCE_MESSAGES.default;

  return (
    <div className="border-t pt-4">
      <h4 className="font-semibold mb-2">Recommended Action:</h4>
      <p className="text-sm">{guidanceMessage}</p>
      <div className="my-4 flex justify-end">
        <DiagnosisActionButton guidance={guidance} symptom={symptom} />
      </div>
    </div>
  );
});
