export function calculatePenDuration(weeklyDosages: number[], penCapacity: number): number {
  let weeks = 0;
  let remaining = penCapacity;

  for (const dosage of weeklyDosages) {
    if (dosage <= remaining) {
      weeks += 1;
      remaining -= dosage;
    } else {
      weeks += remaining / dosage;
      break;
    }
  }

  return weeks;
}
