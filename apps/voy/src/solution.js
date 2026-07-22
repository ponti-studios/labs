function calculatePenDuration(weeklyDosages, penCapacity) {
  let weeks = 0;
  let remaining = penCapacity;

  for (const dosage of weeklyDosages) {
    if (dosage <= remaining) {
      weeks += 1;
      remaining = remaining - dosage;
    } else {
      weeks += remaining / dosage;
    }
  }

  return weeks;
}

module.exports = { calculatePenDuration };
