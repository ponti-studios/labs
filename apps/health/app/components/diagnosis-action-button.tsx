import { Button } from "@pontistudios/ui";
import { useMonitoredSymptoms } from "../hooks/use-monitored-symptoms";
import { type Symptom, TREATMENT_GUIDANCE } from "../types/symptom";
import React, { useCallback, useState } from "react";
import { AppointmentButton } from "./appointment-button";
import { HospitalFinderButton } from "./hospital-finder-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Label, Slider } from "@pontistudios/ui";

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
      return <HospitalFinderButton />;
    case TREATMENT_GUIDANCE.NONIMMEDIATE_CARE:
      return <AppointmentButton />;
    case TREATMENT_GUIDANCE.NO_CARE:
      return <MonitorSymptom symptom={symptom} />;
    default:
      return null;
  }
});

function MonitorSymptom({ symptom }: { symptom: Symptom }) {
  const { monitoredSymptoms, addSymptom, updateSymptom, resolveSymptom } = useMonitoredSymptoms();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [painLevel, setPainLevel] = useState(5);

  const monitoredSymptom = monitoredSymptoms.find(
    (monitoredSymptom) =>
      monitoredSymptom.name === symptom.name &&
      // Filter out resolved symptoms
      !monitoredSymptom.resolvedAt,
  );

  const handleMonitorSymptoms = () => {
    addSymptom(symptom);
  };

  const handleUpdateSymptom = () => {
    if (monitoredSymptom) {
      updateSymptom({
        ...monitoredSymptom,
        painLevel,
        updatedAt: new Date().toISOString(),
      });
      setIsUpdateDialogOpen(false);
    }
  };

  const handleResolveSymptom = useCallback(async () => {
    if (monitoredSymptom) {
      await resolveSymptom.mutateAsync(monitoredSymptom);
      setIsUpdateDialogOpen(false);
    }
  }, [monitoredSymptom, resolveSymptom]);

  if (!monitoredSymptom) {
    return (
      <Button variant="outline" onClick={handleMonitorSymptoms}>
        Monitor Symptoms
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsUpdateDialogOpen(true)}>
        Update your symptom
      </Button>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update {symptom.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pain-level">Pain Level: {painLevel}/10</Label>
              <Slider
                id="pain-level"
                min={1}
                max={10}
                step={1}
                defaultValue={[painLevel]}
                onValueChange={(values) => setPainLevel(values[0])}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleResolveSymptom}>
                Resolve Symptom
              </Button>
              <Button onClick={handleUpdateSymptom}>Save Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
