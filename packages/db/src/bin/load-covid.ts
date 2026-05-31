import { populateCovidData } from "../loaders/covid";

populateCovidData().catch((error) => {
  console.error("COVID population failed:", error);
  process.exit(1);
});
