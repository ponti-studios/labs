import type { Route } from "./+types/api.medication-schedule";

export async function loader(_args: Route.LoaderArgs) {
  return {
    weeklyDosages: [25, 30, 20, 35],
    penCapacity: 100,
    description: "Weekly medication dosages in mg",
  };
}
