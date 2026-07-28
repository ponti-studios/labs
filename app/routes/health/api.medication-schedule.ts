import type { LoaderFunctionArgs } from "react-router";

export async function loader(_args: LoaderFunctionArgs) {
  return {
    weeklyDosages: [25, 30, 20, 35],
    penCapacity: 100,
    description: "Weekly medication dosages in mg",
  };
}
