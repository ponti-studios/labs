import { Card, CardContent, CardHeader, CardTitle } from "@ponti-studios/ui/primitives";
import { useEffect, useState, type JSX } from "react";

interface MedicationSchedule {
  weeklyDosages: number[];
  penCapacity: number;
  description: string;
}
/**
 * Get the number of complete dosages a prescription can provide.
 *
 * @param weeklyDosages
 * @param prescription
 * @returns
 */
function calculateDosages(weeklyDosages: number[], prescription: number): number {
  let weeks = 0;
  let remaining = prescription;

  for (const dosage of weeklyDosages) {
    if (dosage <= remaining) {
      weeks += 1;
      remaining = remaining - dosage;
    } else {
      weeks += remaining / dosage;
      break;
    }
  }

  return weeks;
}

/**
 * Medication Pen Duration Calculator
 *
 * Calculates how many weeks a medication pen (100mg capacity) will last
 * given weekly dosage amounts. Displays each week's dosage and the total.
 */
export default function MedicationPen(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<MedicationSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortController = new AbortController();

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch("/health/api/medication-schedule", {
          signal: abortController.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MedicationSchedule = await res.json();
        setSchedule(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load medication schedule");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchedule();

    // If component detaches, abort request
    return () => abortController.abort();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-muted-foreground animate-pulse">Loading medication schedule…</p>
      </div>
    );
  }

  if (error || schedule === null) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-destructive">{error ?? "No medication schedule available."}</p>
      </div>
    );
  }

  const totalWeeks = calculateDosages(schedule.weeklyDosages, schedule.penCapacity);
  const fullWeeks = schedule.weeklyDosages.filter((_, i) => i < Math.floor(totalWeeks));
  const partialDose =
    totalWeeks % 1 !== 0 ? schedule.weeklyDosages[Math.floor(totalWeeks)] * (totalWeeks % 1) : null;

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Medication Pen Duration</h1>
        <p className="text-muted-foreground max-w-md">
          Calculate how many weeks a {schedule.penCapacity}mg medication pen will last based on
          weekly dosage amounts.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">
            Total:{" "}
            <span className="text-foreground">
              {Number.isInteger(totalWeeks)
                ? `${totalWeeks} weeks`
                : `${totalWeeks.toFixed(1)} weeks`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {fullWeeks.map((dose, i) => (
              <li
                key={i}
                className="bg-muted flex items-center justify-between rounded-md px-4 py-2"
              >
                <span className="font-medium">Week {i + 1}</span>
                <span className="text-muted-foreground tabular-nums">{dose} mg</span>
              </li>
            ))}
            {partialDose !== null && (
              <li className="bg-muted/50 border-muted-foreground/20 flex items-center justify-between rounded-md border border-dashed px-4 py-2">
                <span className="font-medium">Week {Math.floor(totalWeeks) + 1} (partial)</span>
                <span className="text-muted-foreground tabular-nums">{partialDose.toFixed(1)} mg</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
