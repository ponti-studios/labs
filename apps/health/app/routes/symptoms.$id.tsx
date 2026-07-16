import { Label } from "@pontistudios/ui/primitives";
import { Slider } from "@pontistudios/ui/forms";
import { useParams, useNavigate, Link } from "react-router";
import { useState } from "react";
import { Button } from "@pontistudios/ui/primitives";
import { cn } from "@pontistudios/ui/utilities";
import { formatDistanceToNow, format } from "date-fns";
import { useMonitoredSymptoms } from "../hooks/use-monitored-symptoms";
import { TREATMENT_GUIDANCE } from "../types/symptom";

export default function SymptomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { monitoredSymptoms, updateSymptom, resolveSymptom } = useMonitoredSymptoms();
  const [painLevel, setPainLevel] = useState(5);

  const symptom = monitoredSymptoms.find((s) => s.id === id);

  if (!symptom) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-12 text-center">
        <p className="text-secondary">Symptom not found.</p>
        <Button asChild>
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const handleUpdate = () => {
    updateSymptom({ ...symptom, painLevel, updatedAt: new Date().toISOString() });
  };

  const handleResolve = async () => {
    await resolveSymptom.mutateAsync(symptom);
    navigate("/");
  };

  const severityColor = {
    [TREATMENT_GUIDANCE.NO_CARE]: "text-green-600",
    [TREATMENT_GUIDANCE.NONIMMEDIATE_CARE]: "text-amber-600",
    [TREATMENT_GUIDANCE.IMMEDIATE_CARE]: "text-red-600",
  }[symptom.treatment_guidance];

  return (
    <div className="container mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <Link to="/" className="text-secondary hover:text-primary inline-flex text-sm">
        ← Dashboard
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className={cn("text-2xl font-bold capitalize", severityColor)}>{symptom.name}</h1>
        <p className="text-secondary">{symptom.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-secondary text-sm">Severity</p>
          <p className="text-xl font-bold">{symptom.severity_score}/10</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-secondary text-sm">Started</p>
          <p className="text-xl font-bold">
            {formatDistanceToNow(new Date(symptom.createdAt))} ago
          </p>
        </div>
      </div>

      {symptom.resolvedAt ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-800">Resolved</p>
          <p className="text-sm text-green-600">{format(new Date(symptom.resolvedAt), "PPP")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 rounded-lg border p-6">
          <h2 className="font-semibold">Update</h2>

          <div className="flex flex-col gap-3">
            <Label htmlFor="pain-level">Pain Level: {painLevel}/10</Label>
            <Slider
              id="pain-level"
              min={1}
              max={10}
              step={1}
              defaultValue={[symptom.painLevel ?? 5]}
              onValueChange={(values) => setPainLevel(values[0])}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleUpdate} className="flex-1">
              Save Update
            </Button>
            <Button variant="outline" onClick={handleResolve} disabled={resolveSymptom.isPending}>
              Mark Resolved
            </Button>
          </div>
        </div>
      )}

      <div className="text-secondary flex flex-col gap-1 text-sm">
        <p>Last updated: {format(new Date(symptom.updatedAt), "PPp")}</p>
        {symptom.painLevel && <p>Last pain level: {symptom.painLevel}/10</p>}
      </div>
    </div>
  );
}
